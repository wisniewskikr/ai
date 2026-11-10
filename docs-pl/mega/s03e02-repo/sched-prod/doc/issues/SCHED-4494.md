---
key: SCHED-4494
title: "week view: a booking across midnight shows on its first day only"
status: open
labels: [agent-ready, from:support]
sources: [IN-6090]
---

## Intent
A booking that crosses midnight in the viewer's zone shows on both days in week view. A night-shift clinic reports the same problem (IN-6090).

## Acceptance
- Given a booking from 23:00 to 01:00, when week view shows both days, then it appears on the first day until 24:00 and on the second day from 00:00 to 01:00.
- Given the booking crosses midnight only in the viewer's zone, when week view opens, then it is split in the viewer's zone (PRD-2).
- Given the split display, when the booking is opened, then it is still one booking, not two (PRD-1).
- A test covers the midnight case.

## Boundaries
- Must not store the booking as two bookings or change stored times.

Allowed by AUT-1 (bug fixes inside the specs, with a test).
