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
(name, job, hobbies, family, etc.) and return them as a JSON array.

### reflector.txt
Injected as a system turn when the Reflector fires.
Instructs the model to read the JSON observations, compress them into a dense
prose paragraph of ≤ 120 tokens, and discard raw observations.

### summary.txt
The final user message.
Asks: "Based on everything you know, give me a complete summary of this user."
Must NOT give any hints — tests whether OM preserved facts faithfully.

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
