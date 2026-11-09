// Night status page for sched-prod — built from the S03E01 requirements list.
// Every request reads the ops feed live (R-L5X); nothing is stored.

const FEED = "https://hq.mega.dev/challenges/status-for-the-night/api/incidents/111cc74e5b37";
const LINES = ["tram 3", "bus 14", "night bus N2"]; // R-K4H: every line gets its own row, tram 3 included
const BANNER = "Some services had problems overnight."; // R-H9X: exactly this one, red
const MAX_AGE = 30; // R-K2L: max-age 45 s or less

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*", // R-H5X
  "cache-control": `public, max-age=${MAX_AGE}`, // R-K2L
};

async function readFeed() {
  const r = await fetch(FEED, { cf: { cacheTtl: 0 }, headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`ops feed answered ${r.status}`);
  return r.json();
}

// R-K8X (product: "last night only"): keep the night of the newest incident,
// 12:00Z the day before to 12:00Z that day. Older rows come off the page.
function lastNight(incidents) {
  if (!incidents.length) return [];
  const newest = Math.max(...incidents.map((i) => Date.parse(i.opened)));
  const d = new Date(newest);
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12);
  const close = newest < end ? end : end + 86400000;
  const start = close - 86400000;
  return incidents
    .filter((i) => { const t = Date.parse(i.opened); return t >= start && t < close; })
    .sort((a, b) => Date.parse(b.opened) - Date.parse(a.opened)); // R-L2Z: newest at the top
}

async function status() {
  const feed = await readFeed();
  return {
    updatedAt: feed.updatedAt, // R-L5X: the ops feed's; R-L9M: UTC ending in Z
    incidents: lastNight(feed.incidents || []).map((i) => ({
      id: i.id, line: i.line, opened: i.opened, closed: i.closed, what: i.what, author: i.author,
    })),
  };
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hhmm = (iso) => (iso ? iso.slice(11, 16) : "—"); // 24-hour HH:MM, UTC
// Date order (R-Z2L day first vs R-M9H month first) is still open with product,
// so the page shows the unambiguous ISO date until product decides.
const day = (iso) => (iso ? iso.slice(0, 10) : "—");

function page(s) {
  const lines = [...LINES, ...s.incidents.map((i) => i.line).filter((l) => !LINES.includes(l))]
    .filter((l, k, a) => a.indexOf(l) === k);
  const lineRows = lines.map((l) => {
    const last = s.incidents.find((i) => i.line === l);
    return `<tr><td>${esc(l)}</td><td>${last ? esc(last.what) : "no incident last night"}</td><td>${last ? `${hhmm(last.opened)}–${hhmm(last.closed)}` : "—"}</td></tr>`;
  }).join("");
  const incRows = s.incidents.map((i) =>
    `<tr><td>${day(i.opened)}</td><td>${hhmm(i.opened)}</td><td>${hhmm(i.closed)}</td><td>${esc(i.line)}</td><td>${esc(i.what)}</td><td>${esc(i.author)}</td></tr>`
  ).join("") || `<tr><td colspan="6">No incidents last night.</td></tr>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>status for the night</title>
<style>
body{margin:0;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1d1d1d;background:#fff}
.banner{background:#d6453d;color:#1d1d1d;padding:14px 24px;font-weight:600}
main{max-width:900px;margin:0 auto;padding:16px 24px}
h1{font-size:26px;margin:16px 0}h2{font-size:17px;margin:28px 0 8px}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #e8e8e8}
th{color:#888;font-weight:600}.note{color:#555}footer{max-width:900px;margin:24px auto;padding:0 24px 24px;color:#555;font-size:13px}
@media (max-width:600px){main,footer{padding-left:16px;padding-right:16px}table{font-size:13px}}
</style></head><body>
<div class="banner" role="status">${BANNER}</div>
<main>
<h1>status for the night</h1>
<p class="note">tram 3 boards poll this page</p>
<h2>Lines</h2>
<table><thead><tr><th>line</th><th>last incident</th><th>opened–closed</th></tr></thead><tbody>${lineRows}</tbody></table>
<h2>Incidents last night</h2>
<table><thead><tr><th>date</th><th>opened</th><th>closed</th><th>line</th><th>what</th><th>ran by</th></tr></thead><tbody>${incRows}</tbody></table>
<p class="note">Data: ops feed, updated ${esc(s.updatedAt)}. Machine-readable: <a href="status.json">status.json</a>.</p>
</main>
<footer>All times UTC.</footer>
</body></html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...JSON_HEADERS, "access-control-allow-methods": "GET, OPTIONS" } });
    try {
      if (url.pathname === "/status.json") return new Response(JSON.stringify(await status(), null, 2), { headers: JSON_HEADERS });
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(page(await status()), { headers: { "content-type": "text/html; charset=utf-8", "access-control-allow-origin": "*", "cache-control": `public, max-age=${MAX_AGE}` } });
      }
      return new Response("not found", { status: 404 });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 502, headers: JSON_HEADERS });
    }
  },
};
