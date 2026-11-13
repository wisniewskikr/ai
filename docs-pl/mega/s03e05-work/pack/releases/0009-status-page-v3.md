---
id: 0009
title: status page v3, new layout
status: accepted
signed-by: product-owner
released: 2026-10-15
---

## Ask
Front desks read the status page on phones and call support when they cannot read it.

## Options
1. Leave the page as it is. kind: decline
2. New layout on the same incident feed. kind: smaller
3. A new page with its own feed. kind: full

Recommendation: 2, because the feed stays the single source.

## Cost of being wrong
Front desks give customers wrong or missing information during an incident.

## Reversibility
Set `status_page_v3` to 0 in `flags.json`. The old layout comes back on the next load.

## When to contact the owner
Product direction goes to the owner. A broken guardrail is a bug: the team fixes it or rolls it back, no new decision.

## Success metric
Support contacts per page view below 2.5%. Baseline 3.1%.

## Guardrail
The status page shows every field an incident carries.

## Release gate
Passed on `ci-1335`, 2026-10-15.

## Decision
Option 2, by product-owner, 2026-10-13.
