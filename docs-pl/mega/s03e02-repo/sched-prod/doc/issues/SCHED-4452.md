---
key: SCHED-4452
title: "calendar sync: Outlook events arrive twice"
status: open
labels: [agent-ready, from:support]
---

## Intent
Each booking is pushed to Outlook once, with its stable id, so a new sync updates the event instead of adding a second one (ADR-0002).

## Acceptance
- Given a booking pushed to an Outlook calendar, when sync runs again, then the calendar holds one event for it, not two.
- Given a booking that changed in sched-prod, when sync runs, then the existing event is updated in place.
- Given an event changed in Outlook, when sync runs, then sched-prod does not read it back (ADR-0002).
- A test reproduces the double event and passes after the fix.

## Boundaries
- Must not add two-way sync or read events from external calendars (ADR-0002).
- Must not delete events clients already have in their calendars.

Allowed by AUT-1 (bug fixes inside the specs, with a test — ADR-0002).
