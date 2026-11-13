---
id: 0010
title: auto-close quiet incidents, behind a flag
status: accepted
signed-by: product-owner
released: 2026-10-29
---

## Ask
Operators start the morning with a list of open incidents nobody is working. They asked for the list to stay short.

## Options
1. Leave the list as it is. kind: decline
2. Close an incident after 45 quiet minutes, on 50% of sites behind `auto_close_quiet`. kind: smaller
3. Close quiet incidents on all sites. kind: full

Recommendation: 2, because a flag gives a clean comparison and a way back.

## Cost of being wrong
A real incident closes while it still needs work. Noticed within a night or two.

## Reversibility
Set `auto_close_quiet` to 0 in `flags.json`. Takes effect on the next board load.

## When to contact the owner
Product direction goes to the owner. A broken guardrail is a bug: the team fixes it or rolls it back, no new decision.

## Success metric
Fewer open incidents at the end of the night shift.
- Measure: incidents still open at 06:00 UTC, flag arm against control, in `signals/auto-close-events.csv`.
- Target: at least 20% fewer in the flag arm than in control, over 14 nights.

## Guardrail
- Median time to resolve in the flag arm no more than 5% above control.
- Reopened incidents in the flag arm no more than 1 percentage point above control.

## Release gate
Passed on `ci-1363`, 2026-10-29.

## Decision
Option 2, by product-owner, 2026-10-27. If the target is met and no guardrail is crossed, the next step is to expand to 100%.
