---
key: SCHED-4486
title: "audit log: keep 90 days"
status: open
labels: [needs-human, from:finance]
---

## Question
Finance asks to keep audit log entries for 90 days and then delete them. Should sched-prod delete stored audit entries older than 90 days?

## Options
1. Delete entries older than 90 days, as asked.
2. Archive entries older than 90 days to cold storage and delete nothing.
3. Keep everything as today.

## Recommendation
Option 2, until finance and legal confirm how long audit entries must be kept for invoices and the client terms.

## Why
Because deleting data that is already stored needs a person (AUT-2), and audit entries can back invoices and client terms (AUT-2). Deletion cannot be undone.
