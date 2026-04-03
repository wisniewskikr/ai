# Multi-Agent Hello World (no tools)

A minimal JavaScript example of a multi-agent LLM pipeline. The goal is to
demonstrate the core orchestrator → subagent pattern in the simplest possible
form: take `"hello world"` from `config.json`, transform it to `"HELLO WORLD"`,
and show every step in the logs.

No tools. No frameworks. No magic. Just two agents talking to an LLM.

---

## Architecture

```
main.js
  └── orchestrator agent        (LLM-powered: plans the task)
        └── subagent            (LLM-powered: executes the transformation)
```

**Orchestrator** — receives the task, asks the LLM how to handle it, then
explicitly delegates to the appropriate subagent via a direct function call.

**Subagent** — receives a single piece of work (text → uppercase), calls the
LLM with a focused system prompt, and returns the result.

Agent-to-agent communication is a plain function call in code, not a tool call.
This makes the control flow explicit, easy to read, and trivial to debug.

---

## Prerequisites

- Node.js >= 18 (native `fetch` is required — no extra HTTP library)
- An [OpenRouter](https://openrouter.ai) API key

---

## Setup

```bash
npm install
```

Configure your API key in `.env`:

```
OPENROUTER_API_KEY=sk-or-...
```

Configure the input and model in `config.json`:

```json
{
  "prompt": "hello world",
  "model": "openai/gpt-4o"
}
```

---

## Run

```bash
npm start
```

Expected output:

```
[...] [INFO ] ========================================
[...] [INFO ]        Multi-Agent Hello World
[...] [INFO ] ========================================
[...] [INFO ] Log file: logs/run-2026-04-03T12-00-00.log
[...] [INFO ] Config loaded — model: openai/gpt-4o | prompt: "hello world"
[...] [INFO ] [Orchestrator] Starting
[...] [INFO ] [Orchestrator] Task: "hello world"
[...] [DEBUG] [Orchestrator] Requesting task plan from LLM
[...] [INFO ] [Orchestrator] Plan: Delegate to text-transformer to convert "hello world" to uppercase.
[...] [INFO ] [Orchestrator] Delegating to text-transformer subagent
[...] [INFO ] [Subagent] Task received: text transformation
[...] [INFO ] [Subagent] Input: "hello world"
[...] [DEBUG] [Subagent] Calling API — model: openai/gpt-4o
[...] [INFO ] [Subagent] Output: "HELLO WORLD"
[...] [INFO ] [Subagent] Task complete
[...] [INFO ] [Orchestrator] Pipeline complete — final result: "HELLO WORLD"
[...] [INFO ] ========================================
[...] [INFO ]   RESULT: HELLO WORLD
[...] [INFO ] ========================================
```

Logs are written to `logs/run-<timestamp>.log`.

---

## Project structure

```
.
├── .env                        # API key (not committed)
├── config.json                 # Input prompt and model selection
├── main.js                     # Entry point
├── package.json
├── README.md
└── src/
    ├── agents/
    │   ├── orchestrator.js     # Plans and delegates tasks
    │   └── subagent.js         # Executes text transformation
    └── lib/
        ├── api.js              # OpenRouter HTTP wrapper
        ├── config.js           # Config + env loading
        └── logger.js           # Console + file logging
```

---

## Adding a new subagent

1. Create `src/agents/my-new-agent.js` with a `run(apiKey, model, input)` export.
2. Import it in `orchestrator.js`.
3. Add it to the orchestrator's system prompt so the LLM knows it exists.
4. Call it when the orchestrator decides the task warrants it.

That's it. No framework registration, no special wiring.

---

## Why no tools?

This example intentionally avoids LLM tool calls to keep the control flow
visible and debuggable. In a tool-based setup the LLM decides at runtime which
function to call; here the orchestrator decides in code after consulting the LLM
for a plan. Both patterns are valid — this one makes tracing and testing easier.
