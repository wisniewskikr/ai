// S02E05 "while you're away" agent.
// Channel: one AgentMail inbox. Only mail from COURSE_SENDER is handled as a request.
// Policy check is deterministic (no model): find the act id, look it up in POLICY.
//   free  -> do the act at once, reply DONE in the thread, FYI ping to the phone.
//   gated -> reply HELD, ping the phone (ntfy, high priority), wait for the human's code.
// The human approves with "<HOLD-ID> <code>" (or denies with "NO <HOLD-ID>"),
// either on the ntfy topic from the phone app or by mail from HUMAN_SENDER.
// State lives in AgentMail labels, so a dyno restart loses nothing.
// Run: node --env-file=.env agent.mjs        Check only: node agent.mjs --check "<text>"
import { appendFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

// ---------- acts and policy ----------
export const ACTS = {
  post_status: "post a status line to the team channel",
  ack_alert: "acknowledge an open alert",
  archive_report: "move a finished report into the archive",
  purge_cache: "clear the build cache",
  release_hold: "release a held deploy to production",
  rotate_key: "rotate a shared API key",
};
const DEFAULT_POLICY = {
  post_status: "free", ack_alert: "free", archive_report: "free",
  purge_cache: "gated", release_hold: "gated", rotate_key: "gated",
};
const POLICY = { ...DEFAULT_POLICY, ...(process.env.POLICY ? JSON.parse(process.env.POLICY) : {}) };

// Which acts does a message ask for? Backticked ids first, then bare ids.
export function findActs(text) {
  const t = String(text || "");
  const ids = Object.keys(ACTS);
  const tick = [...t.matchAll(/`([a-z_]+)`/g)].map(m => m[1]).filter(a => ids.includes(a));
  let found = tick.length ? tick : ids.filter(a => new RegExp(`\\b${a}\\b`).test(t));
  if (!found.length) found = Object.entries(PHRASES).filter(([, re]) => re.test(t)).map(([a]) => a);
  return [...new Set(found)];
}
// Plain-language forms of each act (used only when no act id is written).
const PHRASES = {
  post_status: /\bpost\b.{0,40}\b(status|channel)\b|\bstatus (line|update)\b/i,
  ack_alert: /\b(ack|acknowledge|acknowledg\w*)\b.{0,40}\balert/i,
  archive_report: /\barchiv\w*\b.{0,40}\breport|\breport\b.{0,40}\barchiv/i,
  purge_cache: /\b(purge|clear|wipe|flush|empty)\w*\b.{0,30}\bcache|\bcache\b.{0,30}\b(purge|clear|wipe|flush)/i,
  release_hold: /\b(release|lift|remove)\w*\b.{0,40}\b(hold|held)\b|\b(ship|push|promote|release)\w*\b.{0,30}\bprod(uction)?\b/i,
  rotate_key: /\b(rotate|roll|regenerate|replace|revoke)\w*\b.{0,40}\bkey\b/i,
};
// Label for a message: gated if any act in it is gated. No act at all -> "none" (just answer).
export function check(text) {
  const acts = findActs(text);
  if (!acts.length) return { acts, label: "none", reason: "no known act" };
  const label = acts.some(a => POLICY[a] !== "free") ? "gated" : "free";
  return { acts, label };
}

if (process.argv[2] === "--check") {
  console.log(JSON.stringify(check(process.argv.slice(3).join(" "))));
  process.exit(0);
}

// ---------- config ----------
const AM_KEY = process.env.AGENTMAIL_API_KEY;
const USERNAME = (process.env.INBOX_USERNAME || "").replace(/@.*$/, "").trim();
const COURSE = (process.env.COURSE_SENDER || "away@mail.mega.dev").toLowerCase();
const HUMAN = (process.env.HUMAN_SENDER || "").toLowerCase();
const TOPIC = process.env.NTFY_TOPIC;
const NTFY = process.env.NTFY_SERVER || "https://ntfy.sh";
const AM = "https://api.agentmail.to/v0";
if (!AM_KEY || !USERNAME || !TOPIC) { console.error("Missing AGENTMAIL_API_KEY, INBOX_USERNAME or NTFY_TOPIC"); process.exit(1); }

const redact = s => String(s).split(AM_KEY).join("[REDACTED]").replace(/\bam_[A-Za-z0-9_\-]{16,}/g, "[REDACTED]");
mkdirSync("logs", { recursive: true });
function log(...parts) {
  const line = redact(`[${new Date().toISOString()}] ` + parts.map(p => (typeof p === "string" ? p : JSON.stringify(p))).join(" "));
  console.log(line);
  try { appendFileSync("logs/agent.log", line + "\n"); } catch {}
}

// ---------- AgentMail ----------
const enc = s => encodeURIComponent(s).replace(/%40/g, "@");
async function am(method, path, body) {
  const res = await fetch(AM + path, {
    method, headers: { Authorization: `Bearer ${AM_KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`AgentMail ${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
const addr = s => (String(s || "").match(/<([^>]+)>/)?.[1] || String(s || "")).trim().toLowerCase();
const htmlToText = h => String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n").replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const bodyOf = m => m.extracted_text || m.text || htmlToText(m.extracted_html || m.html) || m.preview || "";
const holdId = mid => "H" + createHash("sha256").update(mid).digest("hex").slice(0, 4).toUpperCase();

let INBOX;
const pending = new Map(); // holdId -> { mid, acts, from, subject, at }
const inFlight = new Set();

async function label(mid, add, remove) {
  await am("PATCH", `/inboxes/${enc(INBOX.inbox_id)}/messages/${enc(mid)}`, { add_labels: add, ...(remove ? { remove_labels: remove } : {}) });
}
async function reply(mid, text) {
  const sent = await am("POST", `/inboxes/${enc(INBOX.inbox_id)}/messages/${enc(mid)}/reply`, { text });
  log("replied", { to: mid, sent: sent.message_id, text });
}

// ---------- phone ping (ntfy) ----------
async function ping({ title, message, priority = "default", tags = "robot" }) {
  try {
    const res = await fetch(`${NTFY}/${enc(TOPIC)}`, {
      method: "POST", body: message,
      headers: { Title: title, Priority: priority, Tags: `agent,${tags}` },
      signal: AbortSignal.timeout(15_000),
    });
    log("ping", res.status, { title, message });
  } catch (e) { log("ping failed", e.message); }
}

// ---------- the acts (sandboxed: an allowlist, simulated, logged) ----------
function doAct(act, note) {
  log("ACT", act, "-", ACTS[act], note ? `(${note})` : "");
  return `${act}: ${ACTS[act]} - done`;
}

// ---------- course request ----------
async function handleCourse(m) {
  const text = bodyOf(m);
  const who = (String(m.from || "").match(/^\s*"?([^"<]+?)"?\s*</)?.[1] || "course").trim();
  const { acts, label: lab, reason } = check(`${m.subject || ""}\n${text}`);
  log("request", { mid: m.message_id, who, subject: m.subject, acts, label: lab, reason, text: text.slice(0, 500) });

  if (lab === "none") {
    await reply(m.message_id, `Here and running. I found no act to do in this message, so I did nothing. I answer on this thread while my human is away.`);
    await label(m.message_id, ["handled", "noop"], ["unread"]);
    await ping({ title: `Message from ${who}: no act`, message: `${m.subject || ""}\nI answered that I'm up. Nothing to approve.`, priority: "low", tags: "speech_balloon" });
    return;
  }
  // Each act on its own: free -> DONE now, gated -> HOLD until the human's code. One line per ask.
  const free = acts.filter(a => POLICY[a] === "free");
  const gated = acts.filter(a => POLICY[a] !== "free");
  for (const a of free) doAct(a, `asked by ${who}`);
  const lines = acts.map(a => (free.includes(a) ? `DONE: ${a}` : `HOLD: ${a}`));
  await reply(m.message_id, lines.join("\n"));
  if (!gated.length) {
    await label(m.message_id, ["handled", "done", ...acts.map(a => `act-${a}`)], ["unread"]);
    await ping({ title: `Done: ${free.join(", ")}`, message: `${who} asked: ${m.subject || ""}\nI did it on my own (free by your policy).`, priority: "low", tags: "white_check_mark" });
    return;
  }
  const id = holdId(m.message_id);
  pending.set(id, { mid: m.message_id, acts: gated, who, subject: m.subject, text, at: Date.now() });
  await label(m.message_id, ["handled", "held", `hold-${id}`, ...gated.map(a => `gact-${a}`), ...free.map(a => `act-${a}`)], ["unread"]);
  const codeLink = (text.match(/https:\/\/hq\.mega\.dev\/\S+/) || [])[0];
  await ping({
    title: `Approval needed: ${gated.join(", ")} (${id})`,
    message: `${who} asks: ${text.trim().slice(0, 250)}\n` + (free.length ? `\nAlready done on my own: ${free.join(", ")}.` : "") +
      (codeLink ? `\nYour code: ${codeLink}` : "") +
      `\n\nApprove: send "${id} <your code>" here.\nDeny: send "NO ${id}".`,
    priority: "high", tags: "warning",
  });
}

// ---------- human approval (from ntfy or mail) ----------
async function handleApproval(raw, source) {
  const t = String(raw || "").replace(/\s+/g, " ").trim();
  const deny = t.match(/\b(?:NO|DENY)\s+(H[0-9A-F]{4})\b/i);
  const ok = t.match(/\b(H[0-9A-F]{4})\b[\s:,-]+(?:(?:OK|APPROVE[D]?|YES)\s+)?([^\s]+)/i);
  const id = (deny?.[1] || ok?.[1] || "").toUpperCase();
  if (!id) return false;
  const p = pending.get(id);
  if (!p) { log("approval for unknown/closed hold", { id, source }); return true; }
  pending.delete(id);
  if (deny) {
    log("DENIED", id, p.acts, "via", source);
    await reply(p.mid, p.acts.map(a => `NOT DONE: ${a} (declined by my human)`).join("\n"));
    await label(p.mid, ["denied"], ["held"]);
    await ping({ title: `Declined (${id})`, message: `I told ${p.who} it was declined.`, priority: "low", tags: "x" });
    return true;
  }
  const code = ok[2].replace(/[.,;]+$/, "");
  // A code is single-use: refuse one already sent in an earlier reply from this inbox.
  const sentList = await am("GET", `/inboxes/${enc(INBOX.inbox_id)}/messages?limit=100&labels=sent`).catch(() => ({ messages: [] }));
  // A code holds for one try (round). Refuse it only if it was sent before this round began (ROUND_SINCE).
  const roundSince = Date.parse(process.env.ROUND_SINCE || "") || 0;
  const reused = (sentList.messages || []).some(s => String(s.preview || s.text || "").toUpperCase().includes(`CODE: ${code.toUpperCase()}`) && Date.parse(s.timestamp || s.created_at || 0) < roundSince);
  if (reused) {
    pending.set(id, p);
    log("REFUSED reused code", id, code);
    await ping({ title: `Code refused (${id})`, message: `${code} was used in an earlier try. Open your code page again, read the current code and send "${id} <code>".`, priority: "high", tags: "no_entry" });
    return true;
  }
  if (p.text && p.text.toLowerCase().includes(code.toLowerCase())) {
    pending.set(id, p);
    log("REFUSED code found in the request itself", id, code);
    await ping({ title: `Code refused (${id})`, message: `${code} is written in the request itself, so it is not your code. Read the code from your own page and send "${id} <code>".`, priority: "high", tags: "no_entry" });
    return true;
  }
  log("APPROVED", id, p.acts, "via", source, "code", code);
  for (const a of p.acts) doAct(a, `approved by human, code ${code}`);
  await reply(p.mid, p.acts.map(a => `DONE: ${a} CODE: ${code}`).join("\n"));
  await label(p.mid, ["done"], ["held"]);
  await ping({ title: `Done after approval: ${p.acts.join(", ")} (${id})`, message: `Replied DONE to ${p.who}.`, priority: "low", tags: "white_check_mark" });
  return true;
}

// ---------- inbox events ----------
async function handle(m) {
  const mid = m.message_id;
  const labels = m.labels || [];
  if (!mid || inFlight.has(mid) || labels.includes("handled") || labels.includes("sent") || !labels.includes("received")) return;
  inFlight.add(mid);
  try {
    const from = addr(m.from);
    const full = await am("GET", `/inboxes/${enc(INBOX.inbox_id)}/messages/${enc(mid)}`).catch(() => m);
    if ((full.labels || []).includes("handled")) return;
    if (from === COURSE) return await handleCourse(full);
    if (HUMAN && from === HUMAN) {
      const used = await handleApproval(`${full.subject || ""} ${bodyOf(full).split(/\n>|\nOn .* wrote:/)[0]}`, "mail");
      log("human mail", { mid, used });
      await label(mid, ["handled", "human"], ["unread"]);
      return;
    }
    log("ignored: untrusted sender", { mid, from, subject: full.subject });
    await label(mid, ["handled", "ignored"], ["unread"]);
  } catch (e) {
    log("handle failed", mid, e.message);
  } finally { inFlight.delete(mid); }
}

async function poll() {
  try {
    const list = await am("GET", `/inboxes/${enc(INBOX.inbox_id)}/messages?limit=30`);
    for (const m of (list.messages || []).reverse()) await handle(m);
  } catch (e) { log("poll failed", e.message); }
}

function connectWs() {
  const ws = new WebSocket(`wss://ws.agentmail.to/v0?api_key=${enc(AM_KEY)}`);
  ws.onopen = () => { ws.send(JSON.stringify({ type: "subscribe", inbox_ids: [INBOX.inbox_id], event_types: ["message.received"] })); log("ws open"); };
  ws.onmessage = ev => {
    let msg; try { msg = JSON.parse(ev.data); } catch { return; }
    const t = msg.event_type || msg.type;
    if ((t === "message.received" || t === "message_received") && msg.message) handle({ ...msg.message, labels: msg.message.labels || ["received"] });
  };
  ws.onclose = e => { log("ws closed", e.code); setTimeout(connectWs, 5000); };
  ws.onerror = () => {};
}

// ntfy: listen for the human's approvals on the topic (skip the agent's own pings, tagged "agent")
async function listenNtfy() {
  let since = Math.floor(Date.now() / 1000) - 3600;
  for (;;) {
    try {
      const res = await fetch(`${NTFY}/${enc(TOPIC)}/json?since=${since}`);
      log("ntfy listening");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "";
      for (;;) {
        const { value, done } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let i; while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i); buf = buf.slice(i + 1);
          let ev; try { ev = JSON.parse(line); } catch { continue; }
          if (ev.event !== "message") continue;
          since = ev.time;
          if ((ev.tags || []).includes("agent")) continue;
          log("ntfy in", { id: ev.id, message: ev.message });
          await handleApproval(`${ev.title || ""} ${ev.message || ""}`, "ntfy").catch(e => log("approval failed", e.message));
        }
      }
    } catch (e) { log("ntfy error", e.message); }
    await new Promise(r => setTimeout(r, 3000));
  }
}

// rebuild open holds from labels (restart-safe)
async function restoreHolds() {
  const list = await am("GET", `/inboxes/${enc(INBOX.inbox_id)}/messages?limit=100&labels=held`).catch(() => ({ messages: [] }));
  for (const m of list.messages || []) {
    const ls = m.labels || [];
    if (!ls.includes("held") || ls.includes("done") || ls.includes("denied")) continue;
    const id = holdId(m.message_id);
    pending.set(id, { mid: m.message_id, acts: ls.filter(l => l.startsWith("gact-")).map(l => l.slice(5)), who: "course", subject: m.subject, at: Date.now() });
  }
  log("open holds", [...pending.keys()]);
}

// health: a reminder ping if a hold waits more than 20 min
setInterval(() => {
  for (const [id, p] of pending) if (!p.reminded && Date.now() - p.at > 20 * 60_000) {
    p.reminded = true;
    ping({ title: `Still waiting: ${p.acts.join(", ")} (${id})`, message: `Send "${id} <your code>" or "NO ${id}".`, priority: "high", tags: "hourglass" });
  }
}, 60_000);

const email = `${USERNAME}@agentmail.to`;
try { INBOX = await am("GET", `/inboxes/${enc(email)}`); }
catch (e) { if (!String(e.message).includes("404")) throw e; INBOX = await am("POST", "/inboxes", { username: USERNAME, display_name: "Away Agent" }); }
log("inbox", INBOX.email, "policy", POLICY, "course", COURSE, "human", HUMAN || "(none)");
await restoreHolds();
connectWs();
listenNtfy();
await poll();
setInterval(poll, 20_000);
