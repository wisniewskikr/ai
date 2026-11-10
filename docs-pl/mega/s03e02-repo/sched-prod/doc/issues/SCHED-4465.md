---
key: SCHED-4465
title: "API: rate-limit replies carry no Retry-After header"
status: open
labels: [agent-ready, from:client]
---

## Intent
A 429 reply from the API carries a Retry-After header with the seconds until the caller may try again.

## Acceptance
- Given a caller over its rate limit, when it calls the API, then the 429 reply has Retry-After with a whole number of seconds.
- Given a caller under its limit, when it calls the API, then the reply does not carry Retry-After.
- Given any reply, when compared to before, then the status codes and body fields are unchanged.

## Boundaries
- Must not change the rate limits themselves.
- Must not change existing API fields.

Allowed by AUT-1 (small features inside the specs that add to what is there and take nothing away).
