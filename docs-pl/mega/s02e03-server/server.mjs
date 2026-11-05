// mega-tools: a remote MCP server with memo, upload and transcribe tools (S02E03 "schema first").
// Local run:  node --env-file=.env server.mjs        (in-memory store when DATABASE_URL is unset)
// Heroku:     web: node server.mjs                   (Postgres via DATABASE_URL)
import crypto from "node:crypto";
import express from "express";
import * as z from "zod";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createStore } from "./store.mjs";
import { oauth } from "./oauth.mjs";
import { planPage } from "./plan.mjs";

const PORT = Number(process.env.PORT || 3000);
const BASE = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
const OR_KEY = process.env.OPENROUTER_API_KEY;
const STT_MODEL = process.env.OPENROUTER_STT_MODEL || "deepgram/nova-3";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const MAX_FILE = 20 * 1024 * 1024;   // 20 MB per upload / audio download
const VERSION = "1.0.0";

if (!OWNER_PASSWORD) console.warn("WARNING: OWNER_PASSWORD is not set - nobody can approve clients.");
if (!OR_KEY) console.warn("WARNING: OPENROUTER_API_KEY is not set - transcribe will fail.");

// ---------- logging (never prints tokens or keys) ----------
const SECRETS = [OR_KEY, OWNER_PASSWORD, SECRET].filter(Boolean);
function log(event, data = {}) {
  let line = JSON.stringify({ t: new Date().toISOString(), event, ...data });
  for (const s of SECRETS) line = line.split(s).join("[REDACTED]");
  console.log(line);
}

const store = createStore();
await store.init();
const signUpload = ticket => crypto.createHmac("sha256", SECRET).update("upload:" + ticket).digest("base64url");
const id = prefix => prefix + "_" + crypto.randomBytes(9).toString("base64url");

// ---------- tool helpers ----------
// structuredContent carries the data; the text block is a short summary so results stay small
const ok = (out, summary) => ({ content: [{ type: "text", text: summary ?? JSON.stringify(out) }], structuredContent: out });
const r2 = n => Math.round(Number(n) * 100) / 100;
const STATUS_HINT = { 400: "Bad Request", 401: "Unauthorized - the file needs sign-in", 403: "Forbidden - access to the file is denied",
  404: "Not Found - there is no file at that address", 410: "Gone - the file was removed", 429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable" };
const who = ctx => ctx?.http?.authInfo?.clientId || ctx?.authInfo?.clientId || "unknown";

const EXT_TYPES = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", webm: "audio/webm", flac: "audio/flac",
  m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", txt: "text/plain", md: "text/markdown", json: "application/json", html: "text/html",
  csv: "text/csv", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", pdf: "application/pdf", svg: "image/svg+xml" };
const extOf = name => (/\.([a-z0-9]+)$/i.exec(name || "")?.[1] || "").toLowerCase();
function audioFormat(contentType, name) {
  const ct = (contentType || "").split(";")[0].trim().toLowerCase();
  const byType = { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav", "audio/vnd.wave": "wav",
    "audio/ogg": "ogg", "audio/opus": "ogg", "audio/webm": "webm", "video/webm": "webm", "audio/flac": "flac", "audio/x-flac": "flac",
    "audio/mp4": "m4a", "audio/m4a": "m4a", "audio/x-m4a": "m4a", "video/mp4": "mp4", "audio/aac": "aac" };
  if (byType[ct]) return byType[ct];
  const e = extOf(name);
  return { oga: "ogg", opus: "ogg" }[e] || (["mp3", "wav", "ogg", "webm", "flac", "m4a", "mp4", "aac"].includes(e) ? e : "mp3");
}

async function loadAudio(url) {
  let u;
  try { u = new URL(url); } catch { throw new Error(`"${url}" is not a valid URL. Give a full http(s) link to an audio file.`); }
  if (!/^https?:$/.test(u.protocol)) throw new Error(`${url} is not an http(s) URL (${u.protocol} is not supported). Give an http(s) link to an audio file.`);
  // our own uploads: read straight from the store
  const own = url.startsWith(BASE + "/files/") ? /^\/files\/([A-Za-z0-9_-]+)/.exec(u.pathname) : null;
  let data, contentType, name = u.pathname;
  if (own) {
    const f = await store.getFile(own[1]);
    if (!f) throw new Error(`${url} does not point to an uploaded file: there is no file with that id on this server (404).`);
    data = Buffer.from(f.data); contentType = f.content_type; name = f.filename;
  } else {
    let r;
    try { r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(60_000), headers: { "User-Agent": "mega-tools-mcp/1.0", Accept: "audio/*, video/*;q=0.9, */*;q=0.5" } }); }
    catch (e) { throw new Error(`Could not reach ${url}: ${e.cause?.code || e.name === "TimeoutError" && "timed out after 60 s" || e.message}.`); }
    if (!r.ok) throw new Error(`Could not download ${url}: the server answered HTTP ${r.status}${STATUS_HINT[r.status] || r.statusText ? " " + (STATUS_HINT[r.status] || r.statusText) : ""}.`);
    contentType = r.headers.get("content-type") || "";
    if (Number(r.headers.get("content-length") || 0) > MAX_FILE) throw new Error(`${url} is larger than the 20 MB limit.`);
    const chunks = []; let size = 0;
    for await (const c of r.body) { size += c.length; if (size > MAX_FILE) throw new Error(`${url} is larger than the 20 MB limit.`); chunks.push(c); }
    data = Buffer.concat(chunks);
  }
  const ct = contentType.split(";")[0].trim().toLowerCase();
  if (/^(text\/|image\/|application\/(json|xml|xhtml|pdf|javascript))/.test(ct))
    throw new Error(`${url} is not an audio file: it returned ${ct}${ct === "text/html" ? " (a web page)" : ""}, not audio. Give a link to an mp3, wav, ogg, webm, flac, m4a or aac file.`);
  if (!data.length) throw new Error(`${url} returned an empty file, not audio.`);
  return { data, format: audioFormat(contentType, name) };
}

async function transcribeAudio(url, language) {
  if (!OR_KEY) throw new Error("transcription is not configured on this server");
  const { data, format } = await loadAudio(url);
  const body = { model: STT_MODEL, input_audio: { data: data.toString("base64"), format }, response_format: "verbose_json", timestamp_granularities: ["segment", "word"] };
  if (language) body.language = language;
  const r = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    method: "POST", signal: AbortSignal.timeout(240_000),
    headers: { Authorization: `Bearer ${OR_KEY}`, "Content-Type": "application/json", "X-Title": "mega-tools-mcp" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(r.status >= 500 || r.status === 429
    ? `Speech-to-text for ${url} failed: the provider is unavailable (HTTP ${r.status}). Try again later.`
    : `Speech-to-text could not read the audio at ${url} (provider answered HTTP ${r.status}): it is probably not a valid or supported audio file (mp3, wav, ogg, webm, flac, m4a, aac).`);
  const j = JSON.parse(text);
  let segments = (j.segments || []).map(s => ({ start: Number(s.start) || 0, end: Number(s.end ?? s.start) || 0, text: String(s.text || "").trim() }))
    .filter(s => s.text);
  // one long segment but word timings available: split into sentences
  const words = (j.words || []).filter(w => w && typeof w.word === "string" && Number.isFinite(Number(w.start)));
  if (segments.length <= 1 && words.length > 1) {
    const out = []; let cur = null;
    for (const w of words) {
      if (!cur) cur = { start: Number(w.start), end: Number(w.end ?? w.start), text: "" };
      cur.text += (cur.text ? " " : "") + w.word.trim();
      cur.end = Number(w.end ?? w.start);
      if (/[.!?…]$/.test(w.word.trim())) { out.push(cur); cur = null; }
    }
    if (cur) out.push(cur);
    if (out.length > 1) segments = out;
  }
  if (!segments.length && j.text) segments = [{ start: 0, end: Number(j.duration) || 0, text: String(j.text).trim() }];
  segments = segments.map(s => ({ start: r2(s.start), end: r2(s.end), text: s.text }));
  return { segments, duration: r2(Number(j.duration) || (segments.at(-1)?.end ?? 0)), format };
}

// ---------- MCP server ----------
function buildServer() {
  const server = new McpServer({ name: "mega-tools", title: "mega-tools: memo, upload, transcribe", version: VERSION, websiteUrl: BASE + "/plan" },
    { capabilities: { tools: {} }, instructions: `Tools: memo_write / memo_search (shared notes), upload (public file links), transcribe (audio URL -> timestamped segments). Docs: ${BASE}/plan` });

  server.registerTool("memo_write", {
    title: "Write a memo",
    description: "Save a text note on this server. Returns the new note's id.",
    inputSchema: z.object({ text: z.string().min(1).max(100_000).describe("The note text to save") }),
    outputSchema: z.object({ id: z.string().describe("Id of the saved note") }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async ({ text }, ctx) => {
    const note = await store.addNote({ id: id("note"), text, author: who(ctx) });
    log("tool.memo_write", { client: who(ctx), id: note.id, chars: text.length });
    return ok({ id: note.id });
  });

  server.registerTool("memo_search", {
    title: "Search memos",
    description: "Find saved notes whose text contains every word of the query (case-insensitive). Newest first. An empty query lists the newest notes.",
    inputSchema: z.object({
      query: z.string().max(1000).describe("Words to look for; empty string lists the newest notes"),
      limit: z.number().int().min(1).max(100).optional().describe("Max notes to return (default 10)"),
    }),
    outputSchema: z.object({
      notes: z.array(z.object({ id: z.string(), text: z.string(), created_at: z.string().describe("ISO 8601 time the note was saved") })),
    }),
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ query, limit }, ctx) => {
    const notes = await store.searchNotes(query, limit || 10);
    log("tool.memo_search", { client: who(ctx), query, found: notes.length });
    return ok({ notes }, `Found ${notes.length} note(s); see structuredContent.`);
  });

  server.registerTool("upload", {
    title: "Upload a file",
    description: "Store a file on this server and get a public link anyone can open (no sign-in). Max 20 MB. " +
      "Small files: send the bytes inline as base64 in content_base64, or plain text in text. " +
      "Large files (anything over ~100 KB): send only filename (and content_type); the result has upload_url - send the raw bytes there with one HTTP PUT " +
      "(e.g. curl -T ./file \"<upload_url>\") within 15 minutes, then the url serves the file. This keeps big files out of the tool call.",
    inputSchema: z.object({
      filename: z.string().min(1).max(200).describe("File name, e.g. notes.txt or clip.mp3"),
      content_base64: z.string().optional().describe("File bytes, base64-encoded (small files)"),
      text: z.string().optional().describe("File content as plain text (small files; alternative to content_base64)"),
      content_type: z.string().max(200).optional().describe("MIME type; guessed from the file name when omitted"),
    }),
    outputSchema: z.object({
      url: z.string().describe("Public link to the file, served by this server"),
      id: z.string(), filename: z.string(), content_type: z.string(),
      size: z.number().int().optional().describe("Size in bytes (inline uploads)"),
      upload_url: z.string().optional().describe("Only when no content was sent: PUT the raw file bytes here, once, before upload_expires_at"),
      upload_expires_at: z.string().optional().describe("ISO 8601 expiry of upload_url"),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async ({ filename, content_base64, text, content_type }, ctx) => {
    if (content_base64 != null && text != null) throw new Error("send at most one of content_base64 or text (or neither, to get an upload_url for a large file)");
    const name = filename.replace(/[\\/]/g, "_").replace(/[\x00-\x1f]/g, "");
    if (content_base64 == null && text == null) {
      const type = content_type || EXT_TYPES[extOf(name)] || "application/octet-stream";
      const fileId = id("f");
      const exp = Date.now() + 15 * 60_000;
      const ticket = Buffer.from(JSON.stringify({ id: fileId, n: name, t: type, e: exp, a: who(ctx) })).toString("base64url");
      const upload_url = `${BASE}/uploads/${ticket}.${signUpload(ticket)}`;
      const url = `${BASE}/files/${fileId}/${encodeURIComponent(name)}`;
      log("tool.upload.ticket", { client: who(ctx), id: fileId, filename: name, type });
      return ok({ url, id: fileId, filename: name, content_type: type, upload_url, upload_expires_at: new Date(exp).toISOString() },
        `PUT the file bytes to upload_url within 15 minutes; then ${url} serves it.`);
    }
    const data = content_base64 != null ? Buffer.from(content_base64.replace(/^data:[^,]*,/, ""), "base64") : Buffer.from(text, "utf8");
    if (data.length > MAX_FILE) throw new Error(`${name} is larger than the 20 MB limit`);
    const type = content_type || EXT_TYPES[extOf(name)] || (text != null ? "text/plain; charset=utf-8" : "application/octet-stream");
    const fileId = id("f");
    await store.addFile({ id: fileId, filename: name, content_type: type, size: data.length, data, author: who(ctx) });
    const url = `${BASE}/files/${fileId}/${encodeURIComponent(name)}`;
    log("tool.upload", { client: who(ctx), id: fileId, filename: name, size: data.length, type });
    return ok({ url, id: fileId, filename: name, content_type: type, size: data.length });
  });

  server.registerTool("transcribe", {
    title: "Transcribe audio",
    description: "Turn audio at a URL (mp3, wav, ogg, webm, flac, m4a, aac; max 20 MB) into timestamped text segments. start and end are in seconds.",
    inputSchema: z.object({
      url: z.string().describe("http(s) URL of the audio file, e.g. a link from the upload tool"),
      language: z.string().max(10).optional().describe("ISO-639-1 language code; auto-detected when omitted"),
    }),
    outputSchema: z.object({
      segments: z.array(z.object({ start: z.number().describe("Segment start, seconds"), end: z.number().describe("Segment end, seconds"), text: z.string() })),
      duration: z.number().describe("Audio length, seconds"),
    }),
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async ({ url, language }, ctx) => {
    const t0 = Date.now();
    let r;
    try { r = await transcribeAudio(url, language); }
    catch (e) { log("tool.transcribe.error", { client: who(ctx), url, error: e.message }); throw e; }
    log("tool.transcribe", { client: who(ctx), url, format: r.format, segments: r.segments.length, duration: r.duration, ms: Date.now() - t0 });
    const { format, ...out } = r;
    return ok(out, `Transcribed ${out.segments.length} segment(s), ${out.duration} s; see structuredContent.`);
  });

  return server;
}

const mcp = createMcpHandler(buildServer, {
  responseMode: "sse",            // SSE keep-alives hold long transcriptions open behind Heroku's router
  maxRequestBodySize: 32 * 1024 * 1024,
  onerror: e => log("mcp.error", { error: e.message }),
});
const mcpNode = toNodeHandler(mcp, { onerror: e => log("mcp.adapter_error", { error: e.message }) });

// ---------- HTTP app ----------
const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () => log("http", { m: req.method, p: req.path, s: res.statusCode, ms: Date.now() - t0, mcp: req.get("mcp-method") || undefined, client: req.auth?.clientId }));
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name, Mcp-Session-Id, Last-Event-ID");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Expose-Headers", "WWW-Authenticate, Mcp-Session-Id, MCP-Protocol-Version");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const auth = oauth({ base: BASE, store, ownerPassword: OWNER_PASSWORD, secret: SECRET, log });
app.use(auth.router);

app.get("/", (req, res) => res.redirect(302, "/plan"));
app.get("/plan", (req, res) => res.type("html").send(planPage({ base: BASE, sttModel: STT_MODEL })));
app.get("/health", (req, res) => res.json({ ok: true, version: VERSION }));

app.get("/files/:id{/:name}", async (req, res) => {
  const f = await store.getFile(req.params.id).catch(() => null);
  if (!f) return res.status(404).type("text").send("not found");
  const ct = f.content_type;
  const inline = /^(audio|video|image\/(png|jpeg|gif|webp)|text\/plain|application\/pdf|application\/json)/.test(ct);
  res.set("Content-Type", ct);
  res.set("Content-Length", String(f.size));
  res.set("Content-Disposition", `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(f.filename)}`);
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Content-Security-Policy", "sandbox; default-src 'none'");
  res.set("Cache-Control", "public, max-age=3600");
  res.end(Buffer.from(f.data));
});

// one-time signed upload target for large files (the ticket comes from the upload tool)
app.put("/uploads/:ticket", async (req, res) => {
  const [ticket, sig] = String(req.params.ticket).split(".");
  const fail = (s, msg) => { log("upload.put.error", { s, msg }); res.status(s).json({ error: msg }); };
  if (!ticket || !sig || sig.length !== signUpload(ticket).length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(signUpload(ticket)))) return fail(403, "invalid upload url");
  let t; try { t = JSON.parse(Buffer.from(ticket, "base64url").toString()); } catch { return fail(400, "invalid upload url"); }
  if (Date.now() > t.e) return fail(410, "upload url expired; call the upload tool again");
  if (await store.getFile(t.id).catch(() => null)) return fail(409, "this upload url was already used");
  if (Number(req.get("content-length") || 0) > MAX_FILE) return fail(413, "file is larger than the 20 MB limit");
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX_FILE) return fail(413, "file is larger than the 20 MB limit"); chunks.push(c); }
  const data = Buffer.concat(chunks);
  try { await store.addFile({ id: t.id, filename: t.n, content_type: t.t, size, data, author: t.a }); }
  catch { return fail(409, "this upload url was already used"); }
  const url = `${BASE}/files/${t.id}/${encodeURIComponent(t.n)}`;
  log("upload.put", { client: t.a, id: t.id, filename: t.n, size });
  res.status(201).json({ url, id: t.id, filename: t.n, content_type: t.t, size, sha256: crypto.createHash("sha256").update(data).digest("hex") });
});

app.all("/mcp", auth.requireAuth, (req, res) => void mcpNode(req, res));

app.use((err, req, res, next) => { log("http.error", { p: req.path, error: err.message }); res.status(500).json({ error: "server_error" }); });

app.listen(PORT, () => log("listening", { port: PORT, base: BASE, store: process.env.DATABASE_URL ? "postgres" : "memory", stt: STT_MODEL }));
