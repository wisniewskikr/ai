---
key: SCHED-4498
title: "confirmation email: the cancel link opens the login page"
status: open
labels: [agent-ready, from:support]
---

## Intent
The cancel link in the booking confirmation email opens the booking without a login, the same way the cancel link in the reminder email already does.

## Acceptance
- Given a person who booked without an account, when they click cancel in the confirmation email, then the booking opens with its cancel button and no login page.
- Given the link of one booking, when it is opened, then it does not show or cancel any other booking.
- Given the reminder email, when the fix ships, then its cancel link still works as before.
- A test covers the confirmation link.

## Boundaries
- Must not change the reminder email.
- Must not open the team's account pages without a login.

Allowed by AUT-1 (bug fixes inside the specs, with a test).
