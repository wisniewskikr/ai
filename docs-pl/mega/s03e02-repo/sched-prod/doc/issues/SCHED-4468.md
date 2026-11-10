---
key: SCHED-4468
title: "spacing: move hard-coded margins to the spacing scale"
status: open
labels: [agent-ready, from:product]
---

## Intent
Replace every margin and padding set inside a component with the 4 px spacing scale in the tokens (DES-3). Nothing visible changes. This unblocks a denser layout.

## Acceptance
- Given the component sources, when they are searched for margin and padding literals, then none are found outside the tokens.
- Given any page before and after the change, when screenshots are compared, then no layout shifts.
- Given a value not on the 4 px scale, when it is migrated, then it is not rounded silently — the case is listed in the PR.

## Boundaries
- Must not change any visible spacing.
- Must not add values off the 4 px scale.

Allowed by AUT-1 (bringing code in line with a rule in specs/ when nothing visible changes — DES-3).
