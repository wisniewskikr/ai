---
key: SCHED-4418
title: "week view: first day of the week follows the account locale"
status: open
labels: [agent-ready, from:support]
---

## Intent
Week view starts on the first day of the week given by the account locale, instead of always on Sunday.

## Acceptance
- Given an account with locale de-DE, when week view opens, then the first column is Monday.
- Given an account with locale en-US, when week view opens, then the first column is Sunday.
- Given a booking, when the week start changes, then its stored UTC time does not change (PRD-2).
- A test covers both locales.

## Boundaries
- Must not touch stored booking times or the export.
- Must not change the date format, only the first day of the week.

Allowed by AUT-1 (bug fixes inside the specs, with a test — an Account has a locale, specs/product.md).
