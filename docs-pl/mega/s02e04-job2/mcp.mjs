// Minimal MCP Streamable HTTP client. Usage: node mcp.mjs <method> '<params json>'
import fs from 'node:fs';
const URL_ = 'https://hq.mega.dev/mcp/job/v1.eyJzdWIiOiI0MDIzIiwiYXVkIjoiam9iOnR3by1wbGFjZXM6am9iLTIiLCJpYXQiOjE3OTM4ODMyMjksImV4cCI6MTc5Mzk2OTYyOX0.8Mk2_KnhBTQ7vtMXzFEAYo1St_HyfMui5Mbk2C5ucFU';
const MASK = 'https://hq.mega.dev/mcp/job/***';
const SESS = 'session.json';
const log = (o) => fs.appendFileSync('log.jsonl', JSON.stringify({ ts: new Date().toISOString(), ...o }).split(URL_).join(MASK) + '\n');
let st = fs.existsSync(SESS) ? JSON.parse(fs.readFileSync(SESS, 'utf8')) : {};
let idc = st.id || 1;
async function rpc(method, params, notify = false) {
  const body = notify ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id: idc++, method, params };
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  if (st.sid) headers['Mcp-Session-Id'] = st.sid;
  if (st.pv) headers['MCP-Protocol-Version'] = st.pv;
  log({ dir: 'request', url: MASK, body });
  const r = await fetch(URL_, { method: 'POST', headers, body: JSON.stringify(body) });
  const sid = r.headers.get('mcp-session-id'); if (sid) st.sid = sid;
  const text = await r.text();
  let msg = null;
  if ((r.headers.get('content-type') || '').includes('text/event-stream')) {
    for (const line of text.split(/\r?\n/)) if (line.startsWith('data:')) { try { const j = JSON.parse(line.slice(5)); if (j.id !== undefined) msg = j; } catch {} }
  } else if (text) { try { msg = JSON.parse(text); } catch { msg = { raw: text }; } }
  log({ dir: 'reply', status: r.status, body: msg ?? text });
  return { status: r.status, msg };
}
const [method, p] = process.argv.slice(2);
if (!st.sid) {
  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'job2-worker', version: '1.0' } });
  st.pv = init.msg?.result?.protocolVersion || '2025-06-18';
  await rpc('notifications/initialized', {}, true);
  console.error('INIT:', JSON.stringify(init.msg));
}
const res = await rpc(method, p ? JSON.parse(p) : {});
st.id = idc; fs.writeFileSync(SESS, JSON.stringify(st));
console.log(JSON.stringify(res, null, 2));
