// The plan page: what the tools do, how sign-in works, what data the server keeps.
// Linked as resource_documentation from the protected resource metadata.
export function planPage({ base, sttModel }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>mega-tools plan</title>
<meta name="description" content="Remote MCP server with memo, upload and transcribe tools: what they do, how sign-in works, what data is kept.">
<style>
:root{--bg:#fbfbfa;--fg:#1d1d1f;--muted:#5c5c66;--line:#e2e2e6;--code:#f0f0f3;--accent:#1f6feb}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--fg:#ececf0;--muted:#a0a0ab;--line:#2c2c33;--code:#1f1f24;--accent:#58a6ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:46rem;margin:0 auto;padding:2.5rem 16px 4rem}h1{font-size:1.9rem;margin:0 0 .25rem}h2{margin-top:2.5rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}
p.lead{color:var(--muted);margin-top:0}code{background:var(--code);padding:.1rem .35rem;border-radius:4px;font-size:.9em;word-break:break-all}
table{width:100%;border-collapse:collapse;font-size:.95rem}th,td{text-align:left;vertical-align:top;padding:.55rem .5rem;border-bottom:1px solid var(--line)}
th{color:var(--muted);font-weight:600}a{color:var(--accent)}ol li,ul li{margin:.3rem 0}
</style></head><body><main>
<h1>mega-tools</h1>
<p class="lead">A remote MCP server with four tools: memo_write, memo_search, upload and transcribe. Endpoint: <code>${base}/mcp</code></p>

<h2>Tools</h2>
<p>Every tool declares an input schema and an output schema. Every result comes back as <code>structuredContent</code> that matches the output schema; the text block holds a short summary (memo_search, transcribe) or the same JSON. Tool errors name the input that failed and say what is wrong with it.</p>
<table>
<tr><th>Tool</th><th>Input</th><th>Result</th></tr>
<tr><td><code>memo_write</code></td><td><code>{ text }</code></td><td><code>{ id }</code> — saves a note.</td></tr>
<tr><td><code>memo_search</code></td><td><code>{ query, limit? }</code></td><td><code>{ notes: [{ id, text, created_at }] }</code> — notes that contain every word of the query, case-insensitive, newest first. An empty query lists the newest notes.</td></tr>
<tr><td><code>upload</code></td><td><code>{ filename, content_base64? | text?, content_type? }</code></td><td><code>{ url, id, filename, content_type, size? , upload_url?, upload_expires_at? }</code> — stores the file. Small files go inline (base64 or text). For a large file send only <code>filename</code>: the result adds a one-time signed <code>upload_url</code>; one HTTP <code>PUT</code> of the raw bytes there within 15 minutes stores it, so big files never pass through the tool call. The link <code>url</code> is served by this server under <code>${base}/files/…</code> and opens without sign-in. Max 20 MB.</td></tr>
<tr><td><code>transcribe</code></td><td><code>{ url, language? }</code></td><td><code>{ segments: [{ start, end, text }], duration }</code> — downloads the audio (mp3, wav, ogg, webm, flac, m4a, aac; max 20 MB) and turns it into timestamped text. <code>start</code> and <code>end</code> are in seconds.</td></tr>
</table>

<h2>Protocol</h2>
<ul>
<li>MCP revision <b>2026-07-28</b> over Streamable HTTP at <code>${base}/mcp</code> (stateless, per-request metadata, <code>server/discover</code>).</li>
<li>Clients on the earlier revisions (2025-11-25 and older) are served too, statelessly, through the <code>initialize</code> handshake.</li>
</ul>

<h2>Sign-in</h2>
<p>Only clients the owner lets in can use the tools. The server is an OAuth 2.1 resource server and its own authorization server.</p>
<ol>
<li>A call to <code>/mcp</code> without a token gets <code>401</code> with <code>WWW-Authenticate: Bearer resource_metadata="${base}/.well-known/oauth-protected-resource/mcp"</code>.</li>
<li>Protected resource metadata (RFC 9728) names the authorization server <code>${base}</code>. Its metadata (RFC 8414) is at <code>${base}/.well-known/oauth-authorization-server</code>.</li>
<li>The client identifies itself with a Client ID Metadata Document (an https <code>client_id</code> URL) or registers through Dynamic Client Registration at <code>${base}/register</code>.</li>
<li>The client sends the owner to <code>${base}/authorize</code> (authorization code flow, PKCE S256 required, scope <code>mcp</code>, <code>resource=${base}/mcp</code>). The page shows the client's name and where it returns to. The owner approves with the owner password, or denies.</li>
<li>The client exchanges the code at <code>${base}/token</code> for an access token (1 hour) and a refresh token (30 days, rotated on every use). Tokens are bound to <code>${base}/mcp</code> and sent as <code>Authorization: Bearer</code>.</li>
</ol>

<h2>Data kept</h2>
<table>
<tr><th>Data</th><th>Where and how long</th></tr>
<tr><td>Notes</td><td>Text, id, time and the id of the client that wrote it, in the server's Postgres database, until the owner deletes them. Every signed-in client can search all notes.</td></tr>
<tr><td>Uploaded files</td><td>File bytes, name, type and size, in Postgres, until the owner deletes them. Anyone with the link can open a file.</td></tr>
<tr><td>Audio for transcribe</td><td>Downloaded for the request only and not stored. It is sent to OpenRouter (model <code>${sttModel}</code>) for speech-to-text. The transcript is returned and not stored.</td></tr>
<tr><td>OAuth data</td><td>Registered clients (name, redirect URIs). Codes, access and refresh tokens as SHA-256 hashes only, deleted after they expire.</td></tr>
<tr><td>Logs</td><td>Request method, path, status, client id, tool name and sizes, kept by the host (Heroku) for a short time. Search queries and audio URLs are logged; tokens, passwords, note text and file content are not.</td></tr>
</table>
<p>The server sets no cookies and does no tracking.</p>
</main></body></html>`;
}
