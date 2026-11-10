---
key: SCHED-4446
title: "CSV export: times carry no UTC offset"
status: open
labels: [agent-ready, from:analytics]
---

## Intent
Add a UTC offset column next to the start and end columns of the CSV export, so every tool can read the zone (ADR-0001). The start and end columns stay as they are.

## Acceptance
- Given an account in Europe/Warsaw, when a summer booking is exported, then its offset column reads +02:00.
- Given any export, when compared to the export before the change, then every existing column is still there with the same name, order and format (PRD-3).
- Given a client that parses the old columns, when it reads the new file, then its dates do not change.

## Boundaries
- Must not change the format of the existing start and end columns (IN-5011 relies on mm/dd).
- Must not remove or reorder any column.

Allowed by AUT-1 (new columns that add to what is there and take nothing away).
