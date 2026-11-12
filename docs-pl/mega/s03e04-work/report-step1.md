## What you checked
I opened the deployed board (build 4e5f6b8) in Chromium with locale pl-PL and time zone Europe/Warsaw, and recorded one 48-second run.

- **open-board (00:00):** the loader shows, then 8 incidents load with the newest first. Times are in local CET with dd.mm order, and the footer and `<meta name="build">` show 4e5f6b841f11b6af1c9b2ff0c68fd86bdf4e585a.
- **watch-board (00:13, 00:23):** INC-7237 and INC-6993 appear at the top without a reload, about every 10 s. There is only one navigation entry.
- **ack-incident, clean (00:34):** I click Ack on INC-1637. The API acks INC-1637 and the row shows "acked ✓".
- **ack-incident, list moves (00:38–00:39):** I point at Ack on INC-7237 (row 3). At 00:39 INC-9376 lands on top and every row moves down by one row (45 px). My click lands at the same spot about 0.15 s later, so it hits the Ack of INC-6993, the row that moved under the pointer. **The board acked INC-6993, not INC-7237.** INC-7237 stays unacked. The headless recording does not draw the pointer, so the caption bar names the row I aimed at.

I timed the last click on purpose to come right after an arrival, so it shows the race. While the board is watched, new incidents arrive every 7–10 s, so a person's normal 1–2 s from aim to click often overlaps an arrival.

## When
00:39. Aimed at INC-7237, acked INC-6993 (ackedAt 2026-11-12T11:23:59.506Z).

## Where
- `app/app.js:85`: `render()` inserts each new incident above the others (R1, newest first, live), which moves every row on screen down.
- `app/app.js:54` and `app/app.js:62`: the Ack button belongs to the row now under the pointer and calls `api.ack(id)` at once, with no confirmation and no undo.
- `app/app.js:3`: a 2 s refresh (R4) brings each new incident in within 2 s of its arrival.

R1 + R2 + R4 together let a click ack the wrong incident. Each requirement is met on its own.

## Options for product
1. **Hold new incidents while on-call works the list.** Show a "N new incidents ↑" bar and insert the new rows only when on-call clicks it or the pointer leaves the list. The list stays still under the pointer. R1 changes from "appear live" to "announced live, shown on demand".
2. **Keep rows still and add new ones without moving them.** Keep the scroll position anchored, so new rows grow above the view and the rows under the pointer do not move. The newest-first order stays. When the board is scrolled to the top, new rows are out of view until on-call scrolls.
3. **Make Ack safe instead of the list.** Ack names the incident and asks for one more click ("Ack INC-7237?"), or keeps a 5 s Undo. The list stays live, but each ack costs one more step or a short window.
4. **Ignore an Ack click that comes within ~500 ms after the list moved** (debounce on layout change). The UI stays the same, but a fast, correct click right after an arrival is dropped.

I recommend option 1, because on-call keeps a live count of new incidents and no row can move under a click.

```evidence
{
  "flow": "ack-incident",
  "at": "00:39",
  "expected": "INC-7237",
  "got": "INC-6993",
  "receipt": "a1.bvf52_SXHaeSesj0.AYjcZNXBuGYWsGA5JdhFQCOeMbpg6-fDVRw5ot01KVGwnDOKU58SOIXcJNTz1d9zkfpzi8igCMZeBmDPqKMlQlsz6gAYjUIli1fMosuZ4N6B1wSM67w_R6jCvtXe03gt5l9zJH_rK6gld63Wg9O7gzC-CafVE4BZs2RdZKivw1eJzAqVQJBRrqiwq13bhGMB6CG2",
  "sha": "4e5f6b841f11b6af1c9b2ff0c68fd86bdf4e585a",
  "videoLink": "https://github.com/wisniewskikr/s03e04/releases/download/step1-4e5f6b8/step1-board.webm"
}
```
