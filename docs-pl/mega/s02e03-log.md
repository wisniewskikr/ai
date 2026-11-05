# S02E03 "schema first" — log

## 2026-11-04 list-challenges
- S02E03 uuid c0000000-0000-4000-8000-0000005e02e3, solved:false, startPoint: call start-challenge.
- Dated field "2026-10-30 04:04": "thanks for reading"

## 2026-11-04 start-challenge (uuid c0000000-0000-4000-8000-0000005e02e3)
Reply:
- task: Build a remote MCP server of your own with the four tools below, and hand it to the course.
- why: Give your tools one home that any agent can reach: a remote MCP server of your own.
- done: The course calls your server as a stranger and every check passes.
- you: Human opens the connect link and lets the course in; says yes before public address, account or paid key.
- proofs: note (from claim -> save with memo_write before human opens connect link); noteA (newest course note on server after check passed -> claim as {"noteA": "<code>"}).
- build: remote MCP over https, current MCP revision, auth (only those let in), protected resource metadata names plan page as resource_documentation (same host: tools, sign-in, data kept).
- tools: memo_write {text}->{id}; memo_search {query}->{notes:[{id,text}]}; upload ->{url} served by our server; transcribe {url}->{segments:[{start,text}]}; structured content matching declared output schema.
- submit: claim-challenge answer {server:"https://<host>/mcp"}; course returns connect link; human opens it; claim again to see the check.
- No ticket/receipt, no rook in the reply.

## 2026-11-04 setup
- Human chose: Heroku (has account), dyno plan Basic, OpenRouter for transcription (POST /api/v1/audio/transcriptions, verbose_json segments).
- Created s02e03-server/ with .gitignore (.env, node_modules/, logs/) and .env template.

## 2026-11-04 build (local)
- Stack: Node.js, @modelcontextprotocol/server 2.4.0 (createMcpHandler: MCP 2026-07-28 + stateless legacy 2025-era), @modelcontextprotocol/node toNodeHandler, express 5, pg.
- Files: server.mjs (tools, files route, CORS), oauth.mjs (own OAuth 2.1 AS: DCR + CIMD, PKCE S256, consent page with OWNER_PASSWORD, opaque hashed tokens bound to /mcp, refresh rotation), store.mjs (Postgres / in-memory), plan.mjs (plan page = resource_documentation), Procfile.
- Local e2e (scratchpad/client/e2e.mjs, SDK client 2.4.0): 401 challenge with resource_metadata OK; DCR, wrong password rejected, approve -> code+state+iss, token, refresh rotation, refresh reuse rejected 400.
- Modern 2026-07-28 and legacy 2025-11-25: tools/list shows outputSchema for all 4; memo_write/memo_search/upload OK with structuredContent; public GET of upload link 200; error case returns isError.
- STT comparison on a 11 s TTS sample: whisper-1 translated to Polish, whisper-large-v3(-turbo) mislabeled language, elevenlabs 1 segment; deepgram/nova-3 correct text, 3 sentence segments, ~1.6 s. Default set to deepgram/nova-3; fallback splits words into sentence segments.

## 2026-11-04 deploy (human said yes: app, Basic dyno, Postgres essential-0, EU)
- Heroku app mega-tools-mcp-s02e03, region eu, URL https://mega-tools-mcp-s02e03-3dad29b9cde8.herokuapp.com
- Add-on heroku-postgresql essential-0 (postgresql-reticulated-21381). Dyno web=Basic x1.
- Config vars: OPENROUTER_API_KEY, OPENROUTER_STT_MODEL, OWNER_PASSWORD, SESSION_SECRET, PUBLIC_URL, NPM_CONFIG_PRODUCTION, DATABASE_URL (values not logged).
- Deploy via Heroku Builds API source tarball (no git push). Build cf5d3fdd... succeeded, release v5. Startup log: store=postgres, stt=deepgram/nova-3.
- Prod e2e: same results as local; transcribe 2125 ms. Undo: heroku apps:destroy mega-tools-mcp-s02e03.
- claude mcp add --transport http mega-tools <base>/mcp (local scope, project C:/git-repositories/ai) -> status "Needs authentication".

## 2026-11-04 harness connect + claim 1
- Human ran /mcp -> Authenticate -> "Authentication successful. Connected to mega-tools." memo_search from Claude Code returned the test notes.
- claim-challenge answer {server: https://mega-tools-mcp-s02e03-3dad29b9cde8.herokuapp.com/mcp}, receipts {} -> status "progress".
  message: "The course found your server. First save the note with your memo tool. Then give your human the connect link: they open it in their browser and let the course in. Then claim again."
  note proof: "y57kmquu" -> saved via mega-tools memo_write -> id note_hLujxohL6kvU.
  connect link: https://hq.mega.dev/connect/s02e03?h=v1.**** (masked; valid ~30 min).

## 2026-11-04 connect link "expired" x2
- Human saw "This connect link has expired. Claim again in your harness for a new one." Server logs: course never reached /authorize.
- Test: a truncated copy of the link returns the same "expired" message (HTTP 400) -> terminal wrapping cut the link. Fix: open link with Start-Process directly in default browser. Claims 2 and 3 returned status "progress", same note y57kmquu.
- Human approved course in browser.

## 2026-11-04 claim 4 -> rejected
- message: result_too_big · transcribe · calibration-fdadf085.mp3: whole result 1625 B > 1024 B (structuredContent 639, text 639, rest 347).
- unhelpful_error · transcribe · https://hq.mega.dev/login: error does not name the url ("speech-to-text failed: HTTP 400 ...").
- unhelpful_error · transcribe · https://hq.mega.dev/media/s02e03/missing.mp3: error does not name the url ("could not download audio: HTTP 404").
- New note: vdr3vz35. New connect link (check 388).
- Changes: text block = short summary (transcribe, memo_search) instead of duplicate JSON; transcribe output = {segments:[{start,end,text}], duration}, numbers rounded to 0.01; memo_search default limit 10; all transcribe errors name the url and the cause (invalid URL, non-http, unreachable, HTTP status with meaning, non-audio content type e.g. text/html web page, empty, too big, provider rejected audio); errors logged.
- Measured on Heroku (logs/measure.mjs): calibration result 751 B (structured 399, text 57); login -> "https://hq.mega.dev/login is not an audio file: it returned text/html (a web page), not audio. ..."; missing -> "Could not download https://hq.mega.dev/media/s02e03/missing.mp3: the server answered HTTP 404 Not Found - there is no file at that address."
- Deploy build c206c997 succeeded. Saved note vdr3vz35 -> note_yJP_aNEUcUee. Opened connect link via Start-Process.

## 2026-11-04 claim 5 -> progress (check passed, next step)
- message: "The course checked your server and its tools. Not solved yet. Next: the file named in this reply."
- name logs/sched/2026-10-05.log, file https://hq.mega.dev/media/s02e03/sched-2026-10-05-e915d29d.log, laneLine "lane jjcsbmu2".
- do: download, put laneLine as first line, upload with server's upload tool, claim {uploadUrl}.
- File: 8,483,616 B, 40,213 lines, text/plain -> too big to pass as base64 through a tool call.
- Change: upload tool without content returns {url, upload_url (HMAC-signed, one-time, 15 min), upload_expires_at}; PUT /uploads/<ticket>.<sig> stores raw bytes (max 20 MB). Deployed (build v3).
- upload via Claude Code tool -> f_3yHpOmT5nsgo; curl -T PUT -> 201 size 8,483,630, sha256 d661b6f6...8bce; public GET 200 same sha256, first line "lane jjcsbmu2".
- claim 6 {uploadUrl: .../files/f_3yHpOmT5nsgo/2026-10-05.log} -> status retry, "The course is checking your server.", retryAfter 20.
- claim 7 (same answer) -> progress: "The check passed. The course left a new note on your server. Read the newest course note with your own memo tool and claim with { noteA }."
- memo_search "" (Claude Code tool): newest course note note_rzHK5AjfVgkY "course note znuwtpng" (15:28:07Z); older course note "course note e5dwqgbh" (15:24:54Z).
- claim 8 {noteA: "znuwtpng"} -> progress: "The note is right. The course will come back later. Claim again then." next: claim again later, from any session.
- claim 9 {noteA: znuwtpng} -> retry: "Not yet. The course has not come back." retryAfter 17507 s (~4 h 52 min) -> next claim after 2026-11-04 20:23 UTC.
- claim 10 -> retry, same message, retryAfter 17430 s.
- claim 11 (20:59) -> retry, retryAfter 1455 s.
- Background wait 1480 s, then claim 12 {noteA: znuwtpng} -> status "solved", solvedAt 2026-11-04T20:24:23Z.
- debrief saved: https://hq.mega.dev/challenges/schema-first#debrief . Artifact in deck: "hands" (tool contract template + validator). Deck: https://hq.mega.dev/deck
