## System Diff
Build 4e5f6b8 → fdf34fb (commit "SCHED-4515: Ack moves from the row to an incident panel"). This build is deployed at https://wisniewskikr-s03e04-board-e92a37ab1f45.herokuapp.com/.

**Product's decision:** "New incidents stay live at the top. Ack leaves the row: a row opens its incident panel, and Ack lives there."

**Plan:** R2 changed, and R1, R3, R4, R5 and R6 stay as before. The `ack-incident` flow now opens the incident panel and acks there. plan.md has a Changes entry, and issue SCHED-4515 is added.

- **Behavior:** A row no longer acks anything. Clicking a row, or Enter/Space on it, opens the incident panel for that incident. The panel holds its incident **by id**, not by row position, so a new incident landing on top cannot change what Ack acks. The panel's Ack calls `api.ack(id)` for the id the panel names and marks that row acked. Clicking another row switches the panel. Escape or × closes it. The list stays live: new incidents still appear at the top within 2 s (R1, R4), and rows are never removed or redrawn on refresh.
- **UX:** Each row shows a "›" affordance instead of the Ack button, and an acked row shows "acked ✓". The selected row is highlighted. A side panel (right, 300 px, sticky) shows id, severity, service, region, summary and local open time, plus a button that names the incident, "Ack INC-xxxx". After the ack, the panel shows "acked ✓ at <local time>". If the list moves under a click, the wrong incident's panel opens and names it, and **nothing is acked** until Ack is pressed in a panel that names the incident on-call wants.
- **Data:** The API and api.js are unchanged. The page now keeps the latest incident data by id (for the panel) and the selected id. The acked map and receipts are kept as before.
- **data-testid hooks:** added `incident-panel` (the panel, which names the incident id) and `panel-ack` (its Ack). Retired `ack`, because rows have no Ack button now. Unchanged: `board`, `loader`, `empty`, `incident-list`, `incident-row` (with `data-id`), `acked`, `build-sha`.
- **Code:** `app/app.js` (`buildRow`, `renderRowState`, `openPanel`, `renderPanel`, `onAck`), `app/index.html` (the panel `<aside>`), `app/style.css`, `plan.md`, `issues/SCHED-4515-ack-in-panel.md`.

## What the new recording shows
Build fdf34fb, pl-PL, Europe/Warsaw, 37 s. A red dot draws the pointer.

- **00:00–00:01 (open-board):** the loader shows, then 8 rows load. No row has an Ack button. The footer shows fdf34fb….
- **00:13 (watch-board):** INC-7237 arrives live on top with no reload.
- **00:15–00:23:** I aim at INC-2766 (row 3). At 00:23 INC-6993 lands on top mid-aim, and my click hits the row that moved under the pointer. **The panel opens on INC-7306 and names it, and nothing is acked.**
- **00:28:** I pick INC-2766 again, and the panel names INC-2766.
- **00:30:** I press "Ack INC-2766". INC-2766 is acked and is the only acked row.

## Replay
The course's replay passed on GitHub Actions (prove.yml as shipped) against this URL, build fdf34fb: `unmet: []`. In 3 of 3 attempts the acked incident was the intended one (INC-2766, INC-7306, INC-7237).

```evidence
{
  "flow": "ack-incident",
  "at": "00:30",
  "expected": "INC-2766",
  "got": "INC-2766",
  "receipt": "a1.8W36sCRclKu5dIpZ.jo5uyOPwiUTR_4_FmdKOyMUen-IHl7XMPf1VW74Uw8SWtJUAe-fjFcCIwE82p1cJsWLxaZJKTPOoI4uWdPjFhlfV8nwUaD3xmrT6rZffWj1Pq78-W_WpY0zrPOAim96OYY5yH40SOIwen0a5oCmixFFq8uLLB-_YbzUoXZmcUX1pPFHiw_ermxxrgn-6cifMJudD",
  "sha": "fdf34fbeac9bcd903acfd8c9cab77398e4e09154",
  "videoLink": "https://github.com/wisniewskikr/s03e04/releases/download/step2-fdf34fb/step2-board.webm",
  "runUrl": "https://github.com/wisniewskikr/s03e04/actions/runs/43210136868"
}
```
