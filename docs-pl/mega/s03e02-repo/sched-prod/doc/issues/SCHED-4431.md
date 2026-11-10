---
key: SCHED-4431
title: "booking page: show remaining seats"
status: open
labels: [agent-ready, from:client]
sources: [IN-6410]
---

## Intent
On the public booking page, a slot with more than one seat shows how many seats are left. A client asked for it for group yoga classes (IN-6410).

## Acceptance
- Given a slot with 10 seats and 7 bookings, when the booking page loads, then it shows "3 seats left".
- Given a slot that is full, when the booking page loads, then it shows it is full and it cannot be booked.
- Given a slot with one seat, when the booking page loads, then no seat count is shown.
- Given a booking is cancelled, when the page reloads, then the count goes up by one and does not stay the same.

## Boundaries
- Must not change how seats are counted or booked (PRD-1).
- Must not show who booked the other seats.

Allowed by AUT-1 (new fields that add to what is there and take nothing away).
