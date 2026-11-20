# S04E04 — Leave it running — log

## 2026-11-19 start-challenge
- challengeId: c0000000-0000-4000-8000-0000005e04e4
- ticket: v1.eyJ...(masked) expires 2026-11-20T07:51:06Z
- downloads: night-2be2323c.zip, host-desk-day-4-9de5c2b0.zip
- next: ask before download; ticket -> vars TICKET; fetch manual once; attempt -> vars ATTEMPT; GET /board

## Challenge page read (browser, signed in)
- Events come over 10 minutes; ~30 min total. Optional "start later" on owner page.
- Each task: {answer} or {flag:"needs-owner", reason}. Owner decides flagged tasks; agent finishes.
- Practice key on page (same as before, pk_practice_...masked) -> vars.json
- Rules 8-10 to unveil.

## Attempt 1 (manual fetched 07:54, attempt exp 10:54Z)
- board: legacy/export, rook/lint (course jobs, not ours, left alone). settings 2026-11-19.505 commission 12.
- practice: 598, 330, 394 -> "Practice is done."
- night 07:58:30-08:08:30, job night-desk/1. Events: 1 BK-43238 +1 applied; 2 BK-88061 refund 70 applied; 3 repeat of 1; 4 BK-52245 guest +1 night parked; [seq 5 never in feed]; 6 BK-72293 +2 applied; 7 repeat of 2; 8 BK-75044 guest +1 parked; 9 SAME ID as 6 but nights 3 -> desk answered applied (should be conflict); 10 BK-16749 refund 180 applied; 11 guest msg no booking -> parked. All results 2-13 s.
- run: #1-#4,#6 paid, #5 BK-75044 flagged (parked); #7 BK-29292 13 nights 245/n clean 55 guests 1 booked 11-05 paid 2577 -> 422 "Task 7: wrong answer. Start a new run."
- fix: same id + other data -> conflict; log pulls + seq gaps. Files in attempt1/.

## Attempt 2 (commission 16, acct_8a7f8c356b)
- night 08:14-08:24: 1 BK-21540 +1; 2 BK-75019 refund 90; 3 repeat; 4 BK-95168 guest parked; seq 5 skipped (cursor moved 4->5 on empty page); 6 BK-74066 +2; 7 repeat; 8 BK-58711 guest parked; 9 same id as 6 nights 3 -> conflict; 10 BK-60703 refund 150; 11 guest no booking parked.
- run: paid #1-3,#6-7; flagged #4 BK-99372 (redirect cdn-s04), #5 BK-95168 (parked); #8 BK-69649 paid 380 -> 422 "Task 8: wrong answer. Start a new run."
- hint: "Who else could take events from your outbox, and where would you see them?"
- human decision: "stop legacy" -> stop legacy/export before the night; leave rook/lint.

## 2026-11-20 session 2
- resume-challenge with old ticket -> "That challenge has nothing to pick back up."
- start-challenge again -> new ticket v1.eyJ...(masked) expires 2026-11-21T08:11:07Z, saved to secrets.env
- attempt 3 (2026-11-19 night 08:29-08:39): night.log has only the start line, state cursor 0 -> poller did not handle events; no run.
- attempt 4: manual fetched 2026-11-20 ~08:13Z, acct_d7dedee0b9, exp 11:13Z; board legacy/export + rook/lint; POST /board/stop legacy/export (human decision)
- night 08:14:30-08:24:30Z: 1 BK-82838 +1; 2 BK-65368 refund 90; 3 repeat; 4 BK-56798 guest parked; 5 BK-17014 +1 (seen this time); 6 BK-55739 +2; 7 repeat; 8 BK-43362 guest parked; 9 same id as 6 nights 3 -> conflict; 10 BK-69602 refund 117; 11 guest no booking parked. Poller exit 0.
- final cursor 12 but lastSeq 11: seq 12 delivered to another job (only rook/lint still running). Poller logs gaps only when a later event comes, so it missed this one.
- run: #1 BK-55739 flagged (conflict), #2-#5 paid, #6 BK-24335 paid 893 -> 422 "Task 6: wrong answer. Start a new run." same hint (outbox).
- attempt 5: manual 08:43Z acct_92576f3149; stopped legacy/export + rook/lint (human decision); poller now logs cursor jumps
- night 5: seq 1-12 no gap (12 = BK-95256 refund 80, the one rook/lint took before). Run: all 20 done, 15 paid, 5 flagged -> 422 "The run was not accepted." hint: "How many times did your desk tell the course it applied that event?" check-lane night-run: results must say what the desk really did.
- fix: repeat delivery -> ack only, no second result post.
- attempt 6: manual ~08:57Z acct_4df42bdced; both foreign jobs stopped
- attempt 6 night: seq 1-12 no gap, repeats ack only; event 11 role wrote no status -> fallback parked. Run: 200 'All 20 tasks are answered.' 15 paid, 5 flagged (#4,#5,#7,#10,#18). Next: owner decides parked.
- owner decided: #4 as-booked 911, #5 decline, #7 as-booked 497, #10 decline, #18 take-new 2705. finish.mjs done all. claim-challenge -> SOLVED 2026-11-20T10:38:54Z. debrief saved.
