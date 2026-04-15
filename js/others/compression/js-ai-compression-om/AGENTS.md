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
OBSERVER_TRIGGER  = every 10 user messages
REFLECTOR_TRIGGER = every 5 messages AFTER the Observer has run
```

Flow:

```
msg 1-10   → load lines, no compression yet
msg 10     → Observer fires  → writes N observations to active slot
msg 11-15  → continue loading lines
msg 15     → Reflector fires → seals observations, compresses into memory
msg 16     → final prompt: "Summarize what you know about this user"
```

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
Example output from the Observer call:

```
User's name is Joe Doe.
He is a software engineer in Austin, Texas.
He enjoys hiking, reading sci-fi and historical novels.
He plays acoustic guitar.
```

The list is stored in the OM state (`memory.ts`) as `string[]`.

### 3. Does the user press Enter between lines?

**No.** Lines are sent automatically in batch — no user interaction needed
between messages. The app runs from start to finish on its own. The user
only launches the process.

### 4. Execution order when Observer or Reflector triggers

**Reply first, then compress.** When a trigger message is reached (e.g. line
10 for Observer), the sequence is:

```
1. Send biography line to the model
2. Receive and display the model's reply
3. Run Observer / Reflector as a SEPARATE API call
4. Display the phase banner (see §Visual Indicators)
5. Update OM state
6. Display OM status lines
7. Proceed to next line
```

The model's reply to the triggering line is included in the observations that
the Observer sees. The Observer/Reflector call is always a separate, dedicated
API request — never merged with the biography-line call.

### 5. Does the model respond to each biography line?

**Yes.** Every line from `data.txt` is sent as a `user` message and the
model replies before the next line is sent. The reply is printed to the
terminal along with the OM status lines. This makes the compression effect
visible in real time.

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
  "observerTriggerAfterMessages": 10,
  "reflectorTriggerAfterMessages": 5,
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
The final user message.
Asks: "Based on everything you know, give me a complete summary of this user."
Must NOT give any hints — tests whether OM preserved facts faithfully.

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
```
╔══════════════════════════════════════════╗
║  🗜  REFLECTOR  —  compressing memory... ║
║  History wiped. Compressed context only. ║
╚══════════════════════════════════════════╝
```

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
- [ ] `src/core/observer.ts` — fires at trigger, calls observer prompt, updates state
- [ ] `src/core/reflector.ts` — fires at trigger, calls reflector prompt, seals + compresses
- [ ] `src/prompts/*.txt` — all four prompt files
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
