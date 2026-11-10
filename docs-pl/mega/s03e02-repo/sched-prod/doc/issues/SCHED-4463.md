---
key: SCHED-4463
title: "type: move hard-coded font sizes to the type scale"
status: open
labels: [agent-ready, from:product]
---

## Intent
Replace every font size set inside a component with the matching step of the type scale in the tokens (DES-1). Nothing visible changes. This unblocks a larger-text setting.

## Acceptance
- Given the component sources, when they are searched for font sizes, then none are found outside the tokens file.
- Given any page before and after the change, when screenshots are compared, then no text size differs.
- Given a size that is not on the scale, when it is migrated, then the scale is not extended — the case is listed in the PR instead.

## Boundaries
- Must not change any visible text size.
- Must not add steps to the type scale.

Allowed by AUT-1 (bringing code in line with a rule in specs/ when nothing visible changes — DES-1).
