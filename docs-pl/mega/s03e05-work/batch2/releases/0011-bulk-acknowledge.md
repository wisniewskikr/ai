---
id: 0011
title: bulk acknowledge, behind a flag
status: accepted
signed-by: product-owner
released: 2026-10-29
---

## Ask
On a bad night one fault raises several incidents, and operators acknowledge them one by one while pages keep coming.

## Options
1. Keep acknowledging one by one. kind: decline
2. Select incidents and acknowledge them together, on 50% of sites behind `bulk_acknowledge`. kind: smaller
3. Group incidents by cause and acknowledge the group. kind: full

Recommendation: 2, because a flag gives a clean comparison and a way back.

## Cost of being wrong
An incident gets acknowledged and nobody looks at it. Noticed within a night or two.

## Reversibility
Set `bulk_acknowledge` to 0 in `flags.json`. Takes effect on the next board load.

## When to contact the owner
Product direction goes to the owner. A broken guardrail is a bug: the team fixes it or rolls it back, no new decision.

## Success metric
A faster first response on a bad night.
- Measure: median minutes from `incident_opened` to `incident_acked` on bad nights, flag arm against control, in `signals/bulk-ack-events.csv`.
- Bad night: a site and night with 3 or more incidents.
- Target: at least 20% faster in the flag arm than in control, over 14 nights.

## Guardrail
- Missed pages in the flag arm no more than 1 percentage point above control.
- Median time from `incident_acked` to `incident_resolved` in the flag arm no more than 5% above control.

## Release gate
Passed on `ci-1365`, 2026-10-29.

## Decision
Option 2, by product-owner, 2026-10-27. If the target is met and no guardrail is crossed, the next step is to expand to 100%.
