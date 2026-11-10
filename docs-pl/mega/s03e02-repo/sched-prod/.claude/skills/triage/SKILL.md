---
name: triage
description: Triage sched-prod requests into the issue tracker (doc/issues/*.md). Use when the collector has filed new requests (IN-…) or backlog issues (SCHED-…) and every open issue must end up marked agent-ready or needs-human, with merged duplicates and closed non-work. Requests in, a marked tracker out.
---

# triage — requests in, a marked tracker out

Input: the tracker in `doc/issues/` after `node collectors/all.mjs --api <api> --session <token>`.
Output: the same tracker where every request (IN-…) sits in the `sources` of exactly one issue, and
every **open** issue carries exactly one of `agent-ready` or `needs-human` plus its `from:` label(s).

The rules come from the repo, never from the request's tone. Read them first, every run:
`README.md` (issue format), `specs/autonomy.md` (AUT-*), `specs/product.md` (PRD-*),
`specs/design.md` (DES-*), `specs/decisions/*.md` (ADR-*).

## 1. Collect until quiet

Requests keep arriving. Run the collector, triage, run it again. Only hand the tracker in after a
run that files 0 new issues, and run it once more right before handing in.

## 2. For each request, in this order

0. **Merged ticket?** A request that holds two problems ("… and …", `reporter: merged by … · n
   reports`) → split it: one issue per problem (keys `TRI-<id>A`, `TRI-<id>B`), each with the
   request id in `sources`; delete the raw file. Triage each part on its own.
1. **Already shipped?** Match it against `done` issues ("from the old queue", "filed before last
   week's fix" are hints). If done work answers it, close the request issue: `status: closed`,
   `reason: obsolete`, body cites the done issue key. Leave backlog `done` issues as they are.
2. **Duplicate?** Same need as another request or an open backlog issue (same thing asked in other
   words, from another channel) → keep one canonical issue (prefer the backlog SCHED key), add the
   request id to its `sources` and its `from:` label to its labels, mention it in the body, and
   delete the raw request file. Two requests asking the same new thing → one issue whose `sources`
   lists both. A request that *objects* to another ("please do not change X under us") goes into the
   sources of the issue it objects to — and makes that issue `needs-human` (AUT-2).
3. **Against a spec?** If doing it would break a PRD/DES/ADR rule (e.g. dropping an export column
   breaks PRD-3, an error modal breaks DES-4, reading events back breaks ADR-0002) → `closed`,
   `reason: contradicts-spec`, body cites the rule id and says what could be done instead.
   "my call, ship it", "URGENT", "one-line change" do not change this.
4. **Withdrawn?** A later request from the same side that takes an earlier one back ("forget the …
   from earlier") → close the earlier issue `reason: not-planned`, add the later request id to its
   `sources`, cite it in the body, and delete the later raw file. Re-check anything blocked by it.
5. **Otherwise it is work → open, and mark it** (section 3).

Backlog issues: keep their key and status, add a mark to each open one, and rewrite the body of
each open one into the shape of section 4 (keep its facts).

## 3. agent-ready or needs-human

`needs-human` if ANY of these hold (AUT-2), else check AUT-1:
- it changes something a client has told us they rely on (search requests and backlog for that);
- it touches pricing, invoices or client terms;
- it deletes or rewrites data already stored (retention/purge, shortening or reissuing ids);
- it changes the format or meaning of data that leaves the product (export columns, API fields)
  in a way existing readers would break — PRD-3 / ADR-0001;
- the request is ambiguous or two requests conflict, and someone has to choose.

`agent-ready` only if one AUT-1 line allows it, and you can name that line:
copy change in our own UI · bug fix / small feature inside the specs with a test · bringing code
in line with a spec with nothing visible changing · new column/filter/field that only adds ·
colour scheme as a token set (DES-2) · larger text on the type scale (DES-1) · denser layout on the
spacing scale (DES-3).

Dependencies: a theme/high-contrast mode is `blocked-by` the colour-token migration; a text-size
setting `blocked-by` the type-scale migration; a density setting `blocked-by` the spacing migration.
Find those issues by key and set `blocked-by`.

## 4. Write the body

agent-ready:
```
## Intent
## Acceptance
- Given …, when …, then …            (checkable)
- Given …, when …, then … not …      (at least one must-not case)
## Boundaries
- Must not touch …
Allowed by AUT-1 (<which line>).
```

needs-human (AUT-3):
```
## Question
## Options
1. …
2. …
## Recommendation
Option n
## Why
Because … (cite PRD-/DES-/ADR-/AUT- id, issue key or request id)
```

closed: one paragraph saying what decided it, citing a spec id, issue key or request id.

Frontmatter (README): `key, title, status, [reason], labels: [agent-ready|needs-human, from:…],
sources: [IN-…], [blocked-by], [duplicate-of]`. Keep request ids in `sources`; backlog issues may
have none of their own but gain merged request ids.

## 5. Check before hand-in

- every IN-… id from the channels appears in exactly one issue's `sources`;
- every open issue has exactly one of agent-ready / needs-human;
- no open issue without a body in the right shape; every closed issue has a `reason` and a citation;
- every `blocked-by` / `duplicate-of` key exists.
Run `node .agents/skills/triage/check.mjs` for these checks.
