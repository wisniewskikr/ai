# AGENTS.md — ObservationalMemory Demo Application

## Purpose

This file is the authoritative specification for the application to be built.
All agents, contributors, and tools working on this project MUST read and
follow this document before touching any code.

---

## What We Are Building

A TypeScript/Node.js CLI application that demonstrates **Observational Memory
(OM)** compression — a technique popularized by Masta — using the OpenRouter
API. The app streams a biography line by line into a chat conversation, then
triggers Observer and Reflector phases at defined intervals to show that memory
compression keeps context lean without losing critical information.

The final interaction asks the model to summarize what it knows about the user,
proving that key facts survive compression.

---

## Core Concepts

### ObservationalMemory (OM)

OM is a memory-management strategy for LLM chat sessions:

| Component    | Role                                                                 |
|--------------|----------------------------------------------------------------------|
| **Observer** | Watches incoming messages and writes structured observations          |
| **Reflector**| Reads accumulated observations and distils them into a compact memory |
| **Sealed**   | Observations already processed by the Reflector (immutable)          |
| **Active**   | Observations not yet reflected (mutable, still accumulating)         |

### Trigger Rules (hard-coded defaults, overridable in `config.json`)

```
OBSERVER_TRIGGER  = every 5 user messages
REFLECTOR_TRIGGER = every 3 messages AFTER the Observer has run
```

Lower thresholds are intentional — with 15 biography lines they produce two
full OM cycles, which is far more instructive than one cycle at the very end.

Flow across 15 lines of `data.txt`:

```
msg 1-5    → load lines, no compression yet
msg 5      → Observer #1 fires  → extracts facts → active observations: 5
msg 6-8    → continue loading lines
msg 8      → Reflector #1 fires → compresses → history wiped → generation: 1
msg 9-13   → continue loading lines (fresh context, compact memory)
msg 13     → Observer #2 fires  → extracts new facts → active observations: 5
msg 14-15  → continue loading lines
msg 16     → final summary prompt (Reflector #2 would need msg 16 — skipped)
```

Two compression cycles demonstrate the pattern. A single cycle at the end
demonstrates a coincidence.

---

## Clarifications (Authoritative Decisions)

These answers override any ambiguity elsewhere in this document.

### 1. What happens to message history after the Reflector runs?

**Full replacement (true compression).** The Reflector discards the entire
previous message history and replaces it with a single `system` message
containing the compressed prose paragraph. From that point on, the model
works only from the compressed memory — old raw messages are gone. This is
the key demonstration: context shrinks, facts survive.

The resulting `messages[]` array after compression contains **exactly one
entry**: the compressed `system` message. The original `system.txt` prompt
is also discarded. There is no history — that is the point of the project.

### 2. What format do Observer observations use?

**Plain list of strings — one fact per line.** No JSON, no schema, no keys.
The Observer does NOT call the LLM. It deterministically copies the recent
biography lines directly into the observations list. Example:

```typescript
// observer.ts — no API call needed
// The lines ARE the observations. Simple, fast, free.
const newObservations = recentLines.map(line => line.trim());
memory.addObservations(newObservations);
```

The list is stored in the OM state (`memory.ts`) as `string[]`. The LLM is
reserved for the Reflector, which actually needs to understand and compress.

### 3. Does the user press Enter between lines?

**No.** Lines are sent automatically in batch — no user interaction needed
between messages. The app runs from start to finish on its own. The user
only launches the process.

### 4. Execution order when Observer or Reflector triggers

**Reply first, then compress.** When a trigger message is reached (e.g. line
5 for Observer), the sequence is:

```
1. Send biography line to the model
2. Receive and display the model's reply
3. Display the phase banner (see §Visual Indicators)
4. Run Observer (deterministic) OR Reflector (LLM call)
5. Update OM state
6. Display OM status lines
7. Proceed to next line
```

The model's reply to the triggering line is visible before compression starts.
Only the Reflector makes an API call — the Observer is deterministic (see §6).
Never merge Observer/Reflector logic with the biography-line API call.

### 5. Does the model respond to each biography line?

**Yes, but briefly.** Every line from `data.txt` is sent as a `user` message
and the model replies before the next line is sent. The system prompt instructs
the model to keep biography-line replies to **one sentence maximum** — enough
to show it received the message, not enough to clutter the terminal. The
compression effect must be the visual centrepiece, not chatty acknowledgements.

### 6. How are tokens estimated?

**Simple heuristic: `Math.ceil(text.length / 4)`.** Applied to the full
stringified message history before each API call. The `actual` value comes
from the `usage.total_tokens` field in the OpenRouter response. Calibration
is recalculated after each call as a rolling average:
`calibration = estimated / actual`.

---

## Technology Stack

| Concern              | Choice                          |
|----------------------|---------------------------------|
| Language             | TypeScript (strict mode)        |
| Runtime              | Node.js ≥ 20                    |
| AI provider          | OpenRouter (REST, no SDK bloat) |
| Model (default)      | `google/gemini-2.0-flash-001`   |
| HTTP client          | native `fetch` (Node 18+)       |
| Logging              | custom file logger (no deps)    |
| Config               | `config.json` at project root   |

No heavyweight frameworks. No ORM. No bundler unless genuinely needed.

---

## Repository Layout

```
js-ai-compression-om/
├── config.json                  # all tunable knobs
├── AGENTS.md                    # this file
├── README.md                    # user-facing docs (English)
├── package.json
├── tsconfig.json
├── .env                         # OPENROUTER_API_KEY (not committed)
├── .gitignore
│
├── workspace/
│   └── data.txt                 # source biography, one fact per line
│
├── logs/                        # runtime logs (git-ignored)
│   └── YYYY-MM-DD_HH-MM-SS.log
│
└── src/
    ├── index.ts                 # entry point — orchestrates the demo
    │
    ├── prompts/                 # all prompt templates (edit freely)
    │   ├── system.txt           # base system prompt given to the model
    │   ├── observer.txt         # instruction sent when Observer fires
    │   ├── reflector.txt        # instruction sent when Reflector fires
    │   └── summary.txt          # final "summarize the user" prompt
    │
    ├── core/
    │   ├── chat.ts              # OpenRouter fetch wrapper, message history
    │   ├── observer.ts          # Observer logic
    │   ├── reflector.ts         # Reflector logic
    │   └── memory.ts            # OM state: sealed/active counters, tokens
    │
    ├── io/
    │   ├── dataLoader.ts        # reads workspace/data.txt line by line
    │   └── display.ts           # terminal output, status bars
    │
    └── utils/
        ├── logger.ts            # file logger → logs/
        └── config.ts            # loads and validates config.json
```

---

## config.json Schema

Every value that could ever change belongs here. No magic numbers in source.

```jsonc
{
  "model": "google/gemini-2.0-flash-001",
  "openRouterBaseUrl": "https://openrouter.ai/api/v1",
  "dataFile": "workspace/data.txt",
  "observerTriggerAfterMessages": 5,
  "reflectorTriggerAfterMessages": 3,
  "logDir": "logs",
  "maxTokensPerRequest": 1024,
  "temperature": 0.4,
  "streaming": false
}
```

---

## src/prompts/ Contents

### system.txt
Sets the assistant's persona: a helpful AI with a compact memory system.
Must NOT mention OM mechanics to the model — those are meta.

### observer.txt
Injected as a system turn when the Observer fires.
Instructs the model to extract structured observations from recent messages
(name, job, hobbies, family, etc.) and return them as a **plain list of
strings** (one fact per line). No JSON, no schema — simplest format that
survives prompt iteration.

### reflector.txt
Injected as a system turn when the Reflector fires.
Instructs the model to read the plain-string observations, compress them into
a dense prose paragraph of ≤ 120 tokens, and discard raw observations.

### summary.txt
The final user message. Must ask for **specific, verifiable facts** — not a
vague summary. Example:

> Without looking at any previous messages — because there are none — answer
> these questions precisely:
> What is this person's full name? What city do they work in and what is their
> job? What is their spouse's name and how long have they been together? What
> are their children's names and ages? What is the dog's name and breed? What
> sport do they compete in for charity? What do they teach volunteers?

Concrete questions produce concrete answers. A vague prompt produces a vague
answer that proves nothing about compression quality.

---

## Visual Indicators

When Observer or Reflector fires, a clearly visible banner is printed to the
terminal **between** the model's reply and the OM status lines. Banners use
box-drawing characters so they stand out from normal chat output.

### Observer banner
```
╔══════════════════════════════════════════╗
║  🔍  OBSERVER  —  extracting facts...   ║
╚══════════════════════════════════════════╝
```

### Reflector banner
Includes a compression report calculated from OM state before and after:
```
╔══════════════════════════════════════════════════╗
║  🗜  REFLECTOR  —  compressing memory...         ║
║                                                  ║
║  Before:  <N> messages  ~<T> tokens              ║
║  After:    1 message    ~<C> tokens              ║
║  Ratio:   <R>x compression  |  saved <P>%        ║
║                                                  ║
║  History wiped. Compressed context only.         ║
╚══════════════════════════════════════════════════╝
```
`display.ts` receives the before/after token counts from `reflector.ts` and
formats the ratio. This is the single most important piece of output in the
entire demo — make it impossible to miss.

### Application start banner
```
╔══════════════════════════════════════════════════════╗
║   ObservationalMemory Demo  —  powered by OpenRouter ║
║   Loading 15 facts about the user...                 ║
╚══════════════════════════════════════════════════════╝
```

### Final summary banner
```
╔══════════════════════════════════════════════════════╗
║  📋  FINAL SUMMARY  —  What survived compression?   ║
╚══════════════════════════════════════════════════════╝
```

All banners are printed via `src/io/display.ts`. Emoji usage is intentional
here — they act as quick visual anchors when scrolling through terminal output.

---

## Terminal Output Format

After **every** AI response, two status lines MUST be printed:

```
memory: observations=<bool> tokens=<n> generation=<n> gen <g> (reflector run) [<sealed> sealed, <active> active]
usage:  estimated=<n> actual=<n> calibration=<ratio>
```

Example:

```
memory: observations=false tokens=0 generation=0 gen 1 (reflector run) [11 sealed, 5 active]
usage:  estimated=178 actual=282 calibration=0.95
```

Field definitions:

| Field          | Source                                                    |
|----------------|-----------------------------------------------------------|
| `observations` | `true` if active observations exist and not yet reflected |
| `tokens`       | estimated tokens in the current compressed memory block   |
| `generation`   | how many times the Reflector has run this session         |
| `gen <g>`      | same generation counter, shown inline                     |
| `sealed`       | count of observations processed by Reflector              |
| `active`       | count of observations not yet processed                   |
| `estimated`    | token estimate before API call                            |
| `actual`       | tokens reported by OpenRouter response                    |
| `calibration`  | rolling ratio: estimated / actual (precision metric)      |

---

## Logging

- Every log entry is written to `logs/YYYY-MM-DD_HH-MM-SS.log`.
- One file per application run.
- Format: `[HH:MM:SS] [LEVEL] message`
- Levels: `INFO`, `WARN`, `ERROR`, `DEBUG`
- Log everything: config load, each line sent, Observer/Reflector payloads,
  raw API responses, token counts, errors.
- Logs must be human-readable — no JSON blobs inline; pretty-print them.
- `logs/` is git-ignored.

---

## Coding Standards (Torvalds-style)

1. **Clarity over cleverness.** If a junior dev cannot read it in 30 seconds,
   rewrite it.
2. **Functions do one thing.** If a function needs a second paragraph to
   describe what it does, split it.
3. **No unnecessary abstractions.** Do not create a class where a function
   suffices. Do not create a module where an inline expression suffices.
4. **Error handling is not optional.** Every `fetch` call and file read must
   handle failure explicitly. No swallowed exceptions.
5. **Flat is better than nested.** Guard clauses over deep if/else pyramids.
6. **No dead code.** If it is not used, delete it.
7. **Comments explain WHY, not WHAT.** The code shows what; comments explain
   the non-obvious reasoning behind a decision.
8. **`const` by default.** Use `let` only when mutation is genuinely needed.
9. **Strict TypeScript.** `"strict": true` in tsconfig. No `any` unless
   absolutely unavoidable and commented.
10. **No external dependencies unless they save > 50 lines** and have < 10
    transitive deps. Justify every package in a comment next to the import.

---

## Implementation Checklist (for the coding agent)

- [ ] `config.json` — all knobs, validated on startup
- [ ] `src/utils/config.ts` — loader with type guards
- [ ] `src/utils/logger.ts` — file logger, no console.log in production paths
- [ ] `src/io/dataLoader.ts` — reads `data.txt`, returns `string[]`
- [ ] `src/io/display.ts` — prints AI reply + two status lines
- [ ] `src/core/memory.ts` — OM state machine (sealed/active/generation)
- [ ] `src/core/chat.ts` — OpenRouter fetch, message history management
- [ ] `src/core/observer.ts` — fires at trigger, deterministically copies recent lines to observations (NO API call)
- [ ] `src/core/reflector.ts` — fires at trigger, calls reflector prompt, seals + compresses
- [ ] `src/prompts/reflector.txt` — compress observations into ≤120 token prose
- [ ] `src/prompts/system.txt` — persona + ONE SENTENCE MAX for biography replies
- [ ] `src/prompts/summary.txt` — specific fact-by-fact questions (name, spouse, kids, dog, etc.)
- [ ] `src/index.ts` — main loop: load lines → send → maybe observe → maybe reflect → repeat → summary
- [ ] `README.md` — usage, setup, concept explanation in English
- [ ] `package.json` + `tsconfig.json`
- [ ] `.gitignore` updated if needed

---

## Non-Goals

- No web UI, no database, no auth.
- No streaming (keep first version simple; streaming can be a future option).
- No multi-user support.
- No automated tests in v1 (add later once the logic is stable).
