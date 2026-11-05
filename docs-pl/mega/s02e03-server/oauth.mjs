// Minimal OAuth 2.1 authorization server + resource-server gate for the MCP endpoint.
// - Dynamic Client Registration (RFC 7591) and Client ID Metadata Documents (https client_id URLs)
// - Authorization code + PKCE S256 only, refresh tokens with rotation
// - Consent page: the owner approves each client with OWNER_PASSWORD
// - Opaque tokens, stored as SHA-256 hashes, bound to the MCP resource URL (RFC 8707)
import crypto from "node:crypto";
import express from "express";

const ACCESS_TTL = 3600;              // 1 h
const REFRESH_TTL = 30 * 24 * 3600;   // 30 days
const CODE_TTL = 600;                 // 10 min
const SCOPE = "mcp";

const sha256 = s => crypto.createHash("sha256").update(s).digest("hex");
const rand = (n = 32) => crypto.randomBytes(n).toString("base64url");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sameUrl = (a, b) => String(a || "").replace(/\/+$/, "") === String(b || "").replace(/\/+$/, "");
function safeEqual(a, b) {
  const x = Buffer.from(sha256(String(a))), y = Buffer.from(sha256(String(b)));
  return crypto.timingSafeEqual(x, y);
}
function isLoopback(u) { return ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname); }

export function oauth({ base, store, ownerPassword, secret, log }) {
  const resource = base + "/mcp";
  const prmUrl = base + "/.well-known/oauth-protected-resource/mcp";
  const router = express.Router();
  const cimdCache = new Map();
  const failures = { count: 0, since: Date.now() };

  const asMetadata = {
    issuer: base,
    authorization_endpoint: base + "/authorize",
    token_endpoint: base + "/token",
    registration_endpoint: base + "/register",
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_basic", "client_secret_post"],
    scopes_supported: [SCOPE],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
    service_documentation: base + "/plan",
  };
  const prm = {
    resource,
    authorization_servers: [base],
    scopes_supported: [SCOPE],
    bearer_methods_supported: ["header"],
    resource_name: "mega-tools: memo, upload, transcribe",
    resource_documentation: base + "/plan",
  };

  // ---------- metadata ----------
  router.get(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"], (req, res) => res.json(prm));
  router.get(["/.well-known/oauth-authorization-server", "/.well-known/oauth-authorization-server/mcp",
    "/.well-known/openid-configuration", "/.well-known/openid-configuration/mcp"], (req, res) => res.json(asMetadata));

  // ---------- client lookup ----------
  async function fetchCimd(clientId) {
    const hit = cimdCache.get(clientId);
    if (hit && hit.until > Date.now()) return hit.client;
    const u = new URL(clientId);
    if (u.protocol !== "https:" || !u.pathname || u.pathname === "/") throw new Error("client_id URL must be https with a path");
    const r = await fetch(clientId, { headers: { Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`client metadata document returned HTTP ${r.status}`);
    const text = await r.text();
    if (text.length > 65536) throw new Error("client metadata document too large");
    const md = JSON.parse(text);
    if (md.client_id !== clientId) throw new Error("client metadata document client_id does not match its URL");
    if (!Array.isArray(md.redirect_uris) || !md.redirect_uris.length) throw new Error("client metadata document has no redirect_uris");
    const client = { client_id: clientId, metadata: md, secret_hash: null };
    cimdCache.set(clientId, { client, until: Date.now() + 10 * 60_000 });
    return client;
  }
  async function getClient(clientId) {
    if (!clientId) return null;
    if (/^https:\/\//.test(clientId)) return fetchCimd(clientId);
    return store.getClient(clientId);
  }
  function redirectAllowed(client, redirectUri) {
    let want;
    try { want = new URL(redirectUri); } catch { return false; }
    return (client.metadata.redirect_uris || []).some(r => {
      if (r === redirectUri) return true;
      try { // RFC 8252: loopback redirect may use any port
        const have = new URL(r);
        return isLoopback(have) && isLoopback(want) && have.protocol === want.protocol && have.hostname === want.hostname && have.pathname === want.pathname && have.search === want.search;
      } catch { return false; }
    });
  }

  // ---------- registration (RFC 7591) ----------
  router.post("/register", express.json({ limit: "64kb" }), async (req, res) => {
    const md = req.body || {};
    const uris = md.redirect_uris;
    if (!Array.isArray(uris) || !uris.length) return res.status(400).json({ error: "invalid_redirect_uri", error_description: "redirect_uris is required" });
    for (const u of uris) {
      let p; try { p = new URL(u); } catch { return res.status(400).json({ error: "invalid_redirect_uri", error_description: `not a URL: ${u}` }); }
      if (p.protocol === "http:" && !isLoopback(p)) return res.status(400).json({ error: "invalid_redirect_uri", error_description: "http redirect URIs must be loopback" });
      if (p.hash) return res.status(400).json({ error: "invalid_redirect_uri", error_description: "redirect URI must not have a fragment" });
    }
    const method = md.token_endpoint_auth_method || "none";
    if (!asMetadata.token_endpoint_auth_methods_supported.includes(method)) return res.status(400).json({ error: "invalid_client_metadata", error_description: "unsupported token_endpoint_auth_method" });
    const client_id = "c_" + rand(16);
    const secret = method === "none" ? null : rand(32);
    const metadata = {
      client_name: typeof md.client_name === "string" ? md.client_name.slice(0, 200) : undefined,
      client_uri: typeof md.client_uri === "string" ? md.client_uri : undefined,
      redirect_uris: uris,
      grant_types: md.grant_types || ["authorization_code", "refresh_token"],
      response_types: md.response_types || ["code"],
      token_endpoint_auth_method: method,
      scope: SCOPE,
    };
    await store.saveClient({ client_id, metadata, secret_hash: secret ? sha256(secret) : null });
    log("oauth.register", { client_id, client_name: metadata.client_name, method });
    res.status(201).json({ client_id, ...(secret ? { client_secret: secret, client_secret_expires_at: 0 } : {}), client_id_issued_at: Math.floor(Date.now() / 1000), ...metadata });
  });

  // ---------- authorize ----------
  const AUTH_FIELDS = ["response_type", "client_id", "redirect_uri", "code_challenge", "code_challenge_method", "state", "scope", "resource"];
  const sign = obj => crypto.createHmac("sha256", secret).update(JSON.stringify(obj)).digest("base64url");

  function page(title, body, status = 200) {
    return [status, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>:root{color-scheme:light dark}body{font:16px/1.5 system-ui,sans-serif;max-width:34rem;margin:3rem auto;padding:0 1rem}
.card{border:1px solid #8884;border-radius:12px;padding:1.5rem}code{word-break:break-all}input[type=password]{width:100%;padding:.6rem;font:inherit;box-sizing:border-box}
.row{display:flex;gap:.75rem;margin-top:1rem}button{flex:1;padding:.7rem;font:inherit;border-radius:8px;border:1px solid #8886;cursor:pointer}
button.ok{background:#1f6feb;color:#fff;border-color:#1f6feb}.err{color:#d1242f}.muted{opacity:.7;font-size:.9rem}</style></head><body><div class="card">${body}</div></body></html>`];
  }
  function sendPage(res, [status, html]) { res.status(status).type("html").send(html); }

  async function checkAuthRequest(p) {
    const client = await getClient(p.client_id).catch(e => { throw Object.assign(new Error(e.message), { redirectable: false }); });
    if (!client) throw Object.assign(new Error("Unknown client_id."), { redirectable: false });
    if (!p.redirect_uri || !redirectAllowed(client, p.redirect_uri)) throw Object.assign(new Error("redirect_uri is not registered for this client."), { redirectable: false });
    const fail = (error, desc) => Object.assign(new Error(desc), { redirectable: true, error });
    if (p.response_type !== "code") throw fail("unsupported_response_type", "response_type must be code");
    if (!p.code_challenge || p.code_challenge_method !== "S256") throw fail("invalid_request", "PKCE with code_challenge_method=S256 is required");
    if (p.resource && !sameUrl(p.resource, resource) && !sameUrl(p.resource, base)) throw fail("invalid_target", `resource must be ${resource}`);
    if (p.scope && !p.scope.split(" ").every(s => s === SCOPE || s === "")) throw fail("invalid_scope", `only scope "${SCOPE}" is supported`);
    return client;
  }
  function redirectWith(res, redirectUri, params) {
    const u = new URL(redirectUri);
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(k, v);
    res.redirect(302, u.toString());
  }
  function consentPage(client, p, error) {
    const name = client.metadata.client_name || client.client_id;
    const ts = Date.now();
    const fields = { ...Object.fromEntries(AUTH_FIELDS.map(f => [f, p[f] ?? ""])), ts };
    const hidden = Object.entries(fields).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join("");
    return page("Allow access?", `<h1 style="margin-top:0">Allow access?</h1>
<p><b>${esc(name)}</b> wants to use the tools on this server: memo, upload and transcribe.</p>
<p class="muted">Client ID: <code>${esc(client.client_id)}</code><br>After you approve, you go back to: <code>${esc(new URL(p.redirect_uri).origin)}</code></p>
${error ? `<p class="err">${esc(error)}</p>` : ""}
<form method="post" action="/authorize">${hidden}<input type="hidden" name="sig" value="${sign(fields)}">
<label>Owner password<br><input type="password" name="password" autocomplete="current-password" autofocus></label>
<div class="row"><button type="submit" name="decision" value="deny">Deny</button><button class="ok" type="submit" name="decision" value="approve">Approve</button></div></form>
<p class="muted">What this server does and keeps: <a href="/plan">plan page</a>.</p>`);
  }

  router.get("/authorize", async (req, res) => {
    const p = req.query;
    try {
      const client = await checkAuthRequest(p);
      log("oauth.authorize.view", { client_id: client.client_id });
      sendPage(res, consentPage(client, p));
    } catch (e) {
      if (e.redirectable) return redirectWith(res, p.redirect_uri, { error: e.error, error_description: e.message, state: p.state, iss: base });
      log("oauth.authorize.error", { error: e.message });
      sendPage(res, page("Sign-in error", `<h1 style="margin-top:0">Sign-in error</h1><p class="err">${esc(e.message)}</p>`, 400));
    }
  });

  router.post("/authorize", express.urlencoded({ extended: false, limit: "16kb" }), async (req, res) => {
    const b = req.body || {};
    const fields = { ...Object.fromEntries(AUTH_FIELDS.map(f => [f, b[f] ?? ""])), ts: Number(b.ts) };
    if (!b.sig || !safeEqual(b.sig, sign(fields)) || Date.now() - fields.ts > 30 * 60_000)
      return sendPage(res, page("Sign-in error", `<p class="err">This form expired. Start the connection again from your app.</p>`, 400));
    const p = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== ""));
    let client;
    try { client = await checkAuthRequest(p); }
    catch (e) { return sendPage(res, page("Sign-in error", `<p class="err">${esc(e.message)}</p>`, 400)); }
    if (b.decision !== "approve") {
      log("oauth.authorize.denied", { client_id: client.client_id });
      return redirectWith(res, p.redirect_uri, { error: "access_denied", state: p.state, iss: base });
    }
    if (Date.now() - failures.since > 15 * 60_000) { failures.count = 0; failures.since = Date.now(); }
    if (failures.count >= 10) return sendPage(res, consentPage(client, p, "Too many wrong passwords. Try again in 15 minutes."));
    if (!ownerPassword || !safeEqual(b.password || "", ownerPassword)) {
      failures.count++;
      log("oauth.authorize.bad_password", { client_id: client.client_id });
      return sendPage(res, consentPage(client, p, "Wrong password."));
    }
    const code = rand(32);
    await store.putGrant(sha256(code), "code", {
      client_id: client.client_id, redirect_uri: p.redirect_uri, code_challenge: p.code_challenge,
      scope: SCOPE, resource,
    }, new Date(Date.now() + CODE_TTL * 1000));
    log("oauth.authorize.approved", { client_id: client.client_id, client_name: client.metadata.client_name });
    redirectWith(res, p.redirect_uri, { code, state: p.state, iss: base });
  });

  // ---------- token ----------
  async function issueTokens(client_id) {
    const access = rand(32), refresh = rand(32);
    const data = { client_id, scope: SCOPE, resource };
    await store.putGrant(sha256(access), "access", data, new Date(Date.now() + ACCESS_TTL * 1000));
    await store.putGrant(sha256(refresh), "refresh", data, new Date(Date.now() + REFRESH_TTL * 1000));
    store.purge().catch(() => {});
    return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL, refresh_token: refresh, scope: SCOPE };
  }
  router.post("/token", express.urlencoded({ extended: false, limit: "16kb" }), express.json({ limit: "16kb" }), async (req, res) => {
    res.set("Cache-Control", "no-store");
    const b = req.body || {};
    const err = (status, error, desc) => { log("oauth.token.error", { error, desc }); return res.status(status).json({ error, error_description: desc }); };
    // client authentication
    let clientId = b.client_id, clientSecret = b.client_secret;
    const basic = /^Basic (.+)$/i.exec(req.get("authorization") || "");
    if (basic) {
      const [id, sec] = Buffer.from(basic[1], "base64").toString().split(":");
      clientId = decodeURIComponent(id || ""); clientSecret = decodeURIComponent(sec || "");
    }
    let client;
    try { client = await getClient(clientId); } catch (e) { return err(401, "invalid_client", e.message); }
    if (!client) return err(401, "invalid_client", "unknown client_id");
    if (client.secret_hash && (!clientSecret || !safeEqual(sha256(clientSecret), client.secret_hash))) return err(401, "invalid_client", "bad client credentials");
    if (b.resource && !sameUrl(b.resource, resource) && !sameUrl(b.resource, base)) return err(400, "invalid_target", `resource must be ${resource}`);

    if (b.grant_type === "authorization_code") {
      const g = await store.takeGrant(sha256(String(b.code || "")), "code");
      if (!g || g.client_id !== client.client_id) return err(400, "invalid_grant", "code is invalid, used or expired");
      if (b.redirect_uri && b.redirect_uri !== g.redirect_uri) return err(400, "invalid_grant", "redirect_uri does not match");
      const verifier = String(b.code_verifier || "");
      if (!verifier || crypto.createHash("sha256").update(verifier).digest("base64url") !== g.code_challenge) return err(400, "invalid_grant", "PKCE verification failed");
      log("oauth.token.issued", { client_id: client.client_id, grant: "authorization_code" });
      return res.json(await issueTokens(client.client_id));
    }
    if (b.grant_type === "refresh_token") {
      const g = await store.takeGrant(sha256(String(b.refresh_token || "")), "refresh");
      if (!g || g.client_id !== client.client_id) return err(400, "invalid_grant", "refresh_token is invalid or expired");
      log("oauth.token.issued", { client_id: client.client_id, grant: "refresh_token" });
      return res.json(await issueTokens(client.client_id));
    }
    return err(400, "unsupported_grant_type", "use authorization_code or refresh_token");
  });

  // ---------- bearer gate for /mcp ----------
  async function requireAuth(req, res, next) {
    const challenge = (error, desc) => {
      const parts = [`resource_metadata="${prmUrl}"`, `scope="${SCOPE}"`];
      if (error) parts.unshift(`error="${error}"`, `error_description="${desc}"`);
      res.set("WWW-Authenticate", "Bearer " + parts.join(", "));
      return res.status(401).json({ error: error || "unauthorized", error_description: desc || "Bearer token required" });
    };
    const m = /^Bearer\s+(.+)$/i.exec(req.get("authorization") || "");
    if (!m) return challenge();
    const g = await store.getGrant(sha256(m[1].trim()), "access").catch(() => null);
    if (!g) return challenge("invalid_token", "token is invalid or expired");
    if (!sameUrl(g.resource, resource)) return challenge("invalid_token", "token was issued for another resource");
    req.auth = { token: m[1].trim(), clientId: g.client_id, scopes: [g.scope], expiresAt: Math.floor(new Date(g.expires_at).getTime() / 1000), resource: new URL(resource) };
    next();
  }

  return { router, requireAuth, prm, asMetadata };
}
