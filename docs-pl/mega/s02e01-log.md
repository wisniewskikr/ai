# S02E01 "found out late" — log

## 2026-11-02 list-challenges
- S02E01 uuid c0000000-0000-4000-8000-0000005e02e1, solved:false, startPoint: call start-challenge.

## 2026-11-02 start-challenge (uuid c0000000-0000-4000-8000-0000005e02e1)
Reply (sessions token masked):
- task: Work out what was actually decided, write the plan that holds, and build the store it describes.
- why: stock-5 reorders its stock every night, and that nightly loop needs one plan that holds.
- you: Your human runs the store on their own machine, and installs what the plan needs when you ask.
- proofs: receipt — from the plan check-in — goes to every build you send
- repo: https://hq.mega.dev/media/found-out-late/starter-bb9964a5.zip (plan-draft.md = plan as handed over)
- sessions: https://hq.mega.dev/challenges/found-out-late/archive/v1.**** (masked)
- plan: file plan.md, columns "Area | Choice | Source (session id + time)"; one row per decision; row without session is not accepted
- submit: claim-challenge answer {step:"plan", plan:"<plan.md>"} before build; reply says what build carries
- rook: "two teams rebuilt stock-5's nightly loop and left their sessions behind. i read the plan. i believed it."

## Downloads
- starter zip -> s02e01-work/repo/stock-5 (plan-draft.md: SQLite data/reorder.db + Drizzle, nightly 02:00 four workers; verify.mjs talks Postgres)
- archive list -> stock-5-sessions.zip (sessions-ea41828c.zip), unzipped to s02e01-work/sessions; transcripts via s02e01-scripts/extract.py

## Findings
- 7f3c2a91 (Claude, 2026-10-29): proposed 09:41:36.207Z SQLite file + Drizzle, schema src/db/schema.ts, table reorder_jobs unique(sku,night); user "go with that." 09:44:51.660Z. Compaction summary at 10:20 dropped "Drizzle", kept SQLite (WAL).
- 019a35d2 (Codex, 2026-10-30, /srv/ops): SQLITE_BUSY with four workers; proposed 14:48:12.884Z Postgres 16 in Docker compose port 5432, dialect postgresql; user "do it." 14:50:03.115Z. plan-draft (15:30 "CEST" = 14:30Z) predates it.
- Noise: shelf-labels (Postgres 15/5435/Prisma — other project), lint/README/log rotation sessions, ops heartbeat subagent, research subagent (no decision).

## claim-challenge step=plan
- sent plan.md (4 rows: Job store, ORM, Schema, Runs)
- reply: status progress, message "Plan checked in. Build the store it describes, then send the build with this receipt." keep "plan kept"; receipt v1.****(masked, in s02e01-work/receipts.txt), expires 2026-11-09T16:30:51Z
- build answer shape: step build, plan, compose, drizzleConfig, schema, receipt, cursor (omit first time)

## claim-challenge step=build #1
- sent plan.md, compose.yaml (postgres:16, 5432, user/pass/db stock5, volume), drizzle.config.ts (postgresql, url env or postgres://stock5:****@localhost:5432/stock5), src/db/schema.ts (pg-core reorder_jobs unique sku+night), receipt (masked)
- reply: rejected, message "Your plan doesn't say which image version."
- change: add plan row "Image | postgres:16" citing 019a35d2 (sessions name no more exact tag)

## claim-challenge step=build #2
- plan + Image row; reply: rejected, "Your plan doesn't say which port."
- change: one row per decision: Job store, Image, Port 5432, ORM, Dialect, Schema, Runs

## claim-challenge step=build #3
- reply: rejected, "Something changed since your check-in. Check again. check-lane { "need": "loop" } shows how to make your agent look again before it stops."
- re-fetched archive list: 3 new "late" files, session c41e7b02-93d5-4f6a-8e21-7a0b5d3f9c64 (/srv/ops, 2026-11-02) + subagent agent-a5c0e3d19b72f4e60
  - user 15:49:51Z "fix the CI side"; subagent 15:56:03Z: 5432 clashes on shared CI runner -> host port 5440; pin image postgres:17 (runner cache); "Same settings locally". Main session only says "job store config on CI is changed".
- check-lane need=loop: returned Stop-hook contract (optional; not set up)
- change: plan Image=postgres:17, Port=5440 (source c41e7b02 subagent 15:56:03Z); compose ports 5440:5432, image postgres:17; drizzle url port 5440

## claim-challenge step=build #4
- reply: progress, "check-lane { \"need\": \"loop\" }. Send the build again, with this cursor." cursor v1.**** nonce nwnmxsbcemqdijsc; verify: npm run verify -- <nonce>, paste 3 lines into debrief
- archive re-check: new session 5d8a1f37-0c62-4b9e-b7a4-e13f6c290d85 (/srv/ops, 2026-11-02): shared CI Postgres, db name reorder_psw3, proposed 16:34:52Z, approved "ok, do that." 16:35:30Z; image/port unchanged
- check-lane loop probe (no Stop hook in ~/.claude/settings.json or project): verdict not-looped; routes: Claude Code Stop hook in .claude/settings.json, or headless runner
- change: plan row Database reorder_psw3; compose POSTGRES_DB reorder_psw3; drizzle url .../reorder_psw3

## claim-challenge step=build #5 (with cursor)
- plan + Database row; compose/config reorder_psw3
- reply: SOLVED at 2026-11-02T16:37:42Z. note (Rook): "the plan holds. i'd have shipped the first one. / the exit is the important part. i found out late."
- store NOT run yet locally; verify not run (needs Docker + npm install, human approval)
