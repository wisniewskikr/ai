# S01E04 "before i looked" — log

## list-challenges
S01E04 uuid c0000000-0000-4000-8000-0000005e01e4, solved: false.

## start-challenge (2026-10-29)
- task: Turn the plan in your copy of the course template into issues, build it, and send the reviewer a public link to an HTML copy of the page.
- template: https://github.com/MEGA-DOT-DEV/rig-handover
- proof laneMarker: 735v-se5b -> .env LANE_MARKER
- issues: each opens with `Source: plan.md § <n>`, label plan:morning-digest
- submit: claim-challenge answer {repo, preview}
- Human chose host: GitHub Pages (wisniewskikr).

## Repo creation
- gh repo create rig-handover-s01e04 --template ... blocked by Claude Code auto-mode classifier (Create Public Surface). Nothing created.
- Human: "Użyj obecnego repozytorium. Nie twórz nowego." Current repo: wisniewskikr/ai (public, not from template). Brief says: "Do not change a repo they already have." -> asked human to decide.
- Human chose option 1: use wisniewskikr/ai. Template copied (git archive of MEGA-DOT-DEV/rig-handover @7213e13) to docs-pl/mega/s01e04-rig/.
- .env written with LANE_MARKER=735v-se5b (git-ignored).
- Skill link: s01e04-rig/.claude/skills/plan-to-issues -> junction to .agents/skills/plan-to-issues (git-ignored, no copy).
- Skill tool: "Unknown skill: plan-to-issues" in the running session (dir created after start). Followed SKILL.md steps by hand.
- Env: node v25.8.1, pnpm not installed. wisniewskikr/ai: issues on, 0 issues, no label plan:morning-digest, Pages not enabled.
- Note: runs/2026-10-28.jsonl last line truncated (bad line). 5 jobs: rig/rotate-logs, lane/sync, fixtures/refresh, notes/backup, digest/render(owner null).
- Human approved: split (8 issues), issue fields (Source, Scope, Done when, Blocked by, label), label+issues in wisniewskikr/ai, pushes to main, local npm install, Pages via workflow artifact.
- Label plan:morning-digest created. Issues #1-#8 created: https://github.com/wisniewskikr/ai/issues/1 .. /8 (1 types, 2 reader, 3 page, 4 json, 5 board link, 6 route tests, 7 preview, 8 clean up)
- Skill plan-to-issues now discovered by Claude Code via the .claude/skills link (after files under s01e04-rig/ were touched). Pushed template 52be035 + #1 bc882dc.
- Workers launched in worktrees: #2 opus, #3 sonnet, #4 haiku, #6 sonnet. #5 waits for #2. Wrote .github/workflows/s01e04-preview.yml (not pushed): CI renders page, deploys Pages artifact, retention 1 day, marker from repo secret LANE_MARKER.
- Merged+pushed: #2 b05682c (opus), #4 05fd723 (haiku), #3 38f0226 (sonnet, resolved app.tsx conflict by hand), #6 a93c10c (sonnet). tsc ok, npm test 20/20. /digest/2026-10-28 200, JSON same order. Closing comments posted on #1-#4,#6.
- Human approved: enable Pages, secret LANE_MARKER, first publish with marker.
- Preview run 40905360418 success; https://wisniewskikr.github.io/ai/ shows marker 735v-se5b, title rig · digest · 2026-10-28.
- #5 merged 2038ed5 (sonnet), 21 tests green, comment posted.
- claim-challenge {repo: wisniewskikr/ai, preview: https://wisniewskikr.github.io/ai/} -> rejected: "That repo does not match the course template. This Challenge needs a new repo started from MEGA-DOT-DEV/rig-handover. Ask your human before you make it."

## Move to new repo (human: "Utworzyłem na stronie Github repozytorium rig-handover-s01e04. Przekopiuj tam szablon i działaj.")
- wisniewskikr/rig-handover-s01e04 was empty, templateRepository null. Pushed template history (7213e13) + package-lock + rebuilt issue commits + workflow (.github/workflows/preview.yml). Clone at C:\git-repositories\rig-handover-s01e04.
- Label + issues #1-#8 created there (same split). #1-#6 auto-closed by push; closing comments posted (commits 2b5fc4b 345fa67 3011915 9701d22 f9ae999 2d14c8d). 21 tests green.
- New repo: secret LANE_MARKER set, Pages (workflow) enabled, run 40906869912 success; https://wisniewskikr.github.io/rig-handover-s01e04/ shows marker 735v-se5b.
- claim-challenge {repo: wisniewskikr/rig-handover-s01e04, preview: https://wisniewskikr.github.io/rig-handover-s01e04/} -> progress: "Sent to the reviewer, who will look at the preview in a few minutes. Not solved yet." rook: "got it. i'll look in a few."
- Old repo cleanup: run 40907112059 with_marker=false -> wisniewskikr.github.io/ai shows 'no marker set'; marker artifact of run 40905360418 deleted; secret LANE_MARKER deleted; Pages disabled; issues #1-#8 in wisniewskikr/ai closed as moved.
- claim (same answer) -> rejected: "Not accepted: you closed #7 before the reviewer looked. Check your issues and the preview, then send the preview link again." rook: "you closed #7 before i looked." -> reopen #7.
- #7 reopened; claim again -> progress: "Sent to the reviewer, who will look at the preview in a few minutes."
- claim -> progress: "The reviewer has seen the preview. Not solved yet: take your lane marker off the preview. Ask your human first, then save the page again with LANE_MARKER unset and upload it over the same link. Then finish the plan and send the same answer again." rook: "seen. i read it in four seconds. that's the problem. get your marker off it."
- Human approved: upload without marker + finish plan.
- Clean run 40910761630 success: page shows 'no marker set', 0 occurrences of marker. Artifact 12912246475 + secret deleted. Plan moved (425695a, closes #8). #7 closed after review. All 8 closed.
- claim -> SOLVED at 2026-10-29T16:22:59Z. note (Rook): "this is how i run. it's how you run from thursday."
