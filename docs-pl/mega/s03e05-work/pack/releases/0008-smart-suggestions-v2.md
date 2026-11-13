---
id: 0008
title: smart suggestions v2, smaller, behind a flag
status: accepted
signed-by: product-owner
released: 2026-10-15
---

## Ask
On-call operators asked for one clear next step on an incident at night, not a list of buttons.

## Options
1. Keep the v1 list. kind: decline
2. One suggestion per incident, shown with Accept and Dismiss, on 50% of sites behind `smart_suggestions_v2`. kind: smaller
3. A full suggestion list on all sites. kind: full

Recommendation: 2, because a flag gives a clean comparison and a way back.

## Cost of being wrong
Operators lose time on a bad night and bookings wait. Noticed within a night or two.

## Reversibility
Set `smart_suggestions_v2` to 0 in `flags.json`. Takes effect on the next board load. Sites fall back to the v1 list.

## When to contact the owner
Product direction goes to the owner. A broken guardrail is a bug: the team fixes it or rolls it back, no new decision.

## Success metric
On a bad night, fewer restarts.
- Measure: `restart` events per bad night, flag arm against control, in `signals/events.csv`.
- Bad night: a site and night with 3 or more incidents.
- Baseline: 2.81 restarts per bad night, all sites, the four weeks before release.
- Target: at least 10% fewer in the flag arm than in control, over 14 nights.

## Guardrail
- Median time to resolve in the flag arm no more than 5% above control.
- Reopened incidents in the flag arm no more than 1 percentage point above control.

## Reopen threshold
Reopen this decision if the flag arm restarts as much as control or more, or if a guardrail is crossed.

## Release gate
Passed on `ci-1333`, 2026-10-15.

## Decision
Option 2, by product-owner, 2026-10-13. If the target is met and no guardrail is crossed, the next step is to expand to 100%.
