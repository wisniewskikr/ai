---
key: SCHED-4412
title: "colours: move hard-coded colours to design tokens"
status: open
labels: [agent-ready, from:product]
---

## Intent
Replace every raw hex, rgb or named colour in components with the matching `--color-*` design token (DES-2). Nothing visible changes. This unblocks the high-contrast mode (IN-8325).

## Acceptance
- Given the component sources, when they are searched for hex, `rgb(` or named colours, then none are found outside the tokens file.
- Given any page before and after the change, when screenshots are compared, then no colour differs.
- Given the tokens file, when the change is done, then no colour value in it is added or changed, not even one.

## Boundaries
- Must not change any colour the user sees.
- Must not add new palette values; only map existing ones.

Allowed by AUT-1 (bringing code in line with a rule in specs/ when nothing visible changes — DES-2).
