# js-ai-multiagent-tool-native

A minimal "Hello World" example of a multi-agent LLM pipeline where the main
orchestrator delegates work to two subagents: one that transforms text using
pure LLM reasoning, and one that does the same via native tool calling.

The input `"hello world"` becomes `"HELLO WORLD"` — twice, through two
different execution paths — so you can compare both approaches side by side.

---

## Architecture

```
main.js
  └── orchestrator
        ├── subagent-no-tool    (LLM uppercases text by itself)
        └── subagent-with-tool  (LLM calls the to_uppercase native tool)
```

### How it works

1. **Orchestrator** reads the input from `config.json`, asks the LLM for an
   execution plan, then calls both subagents sequentially.

2. **subagent-no-tool** sends the text to the LLM with a system prompt that
   says "return only the uppercased text". No tools involved — the model does
   it on its own.

3. **subagent-with-tool** sends the same text along with the `to_uppercase`
   tool schema. The LLM calls the tool; the code executes it locally; the
   result is fed back so the LLM can produce its final answer. This is the
   standard three-round tool-calling loop:
   - Round 1 — LLM responds with `tool_calls`
   - Round 2 — code executes each tool, appends results as `role:"tool"` messages
   - Round 3 — LLM produces final text answer

4. **main.js** prints both results to the console and logs everything to a
   timestamped file under `logs/`.

### Native tool vs. no tool — when to use which

| | No tool | Native tool |
|---|---|---|
| Reliability | LLM may hallucinate or add extra text | Deterministic — JS function runs locally |
| Latency | 1 API round trip | 3 API round trips |
| Use case | Judgment, summarisation, reasoning | Exact computation, external I/O |

---

## File structure

```
.
├── main.js                          entry point
├── config.json                      model settings and task input
├── .env                             API key (never commit this)
├── package.json
└── src/
    ├── agents/
    │   ├── orchestrator.js          coordinates both subagents
    │   ├── subagent-no-tool.js      uppercase without tools
    │   └── subagent-with-tool.js    uppercase via native tool call
    ├── lib/
    │   ├── api.js                   OpenRouter fetch wrapper
    │   ├── config.js                config.json + .env loader
    │   └── logger.js                dual-output logger (console + file)
    ├── prompts/
    │   ├── orchestrator.txt         orchestrator system prompt
    │   ├── subagent-no-tool.txt     no-tool subagent system prompt
    │   └── subagent-with-tool.txt   tool-using subagent system prompt
    └── tools/
        └── uppercase.js             to_uppercase tool schema + executor
```

---

## Prerequisites

- Node.js 18 or newer (built-in `fetch` required)
- An [OpenRouter](https://openrouter.ai) account and API key

---

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Set your API key**

Create a `.env` file in the project root:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**3. (Optional) Edit `config.json`**

```json
{
  "model":       "openai/gpt-4o",
  "maxTokens":   1024,
  "temperature": 0,
  "baseUrl":     "https://openrouter.ai/api/v1",
  "input":       "hello world"
}
```

Change `input` to whatever text you want uppercased. Change `model` to any
model available on OpenRouter that supports tool calling.

---

## Running

```bash
npm start
```

### Expected output

```
[...] [INFO ] ========================================
[...] [INFO ]  Multi-Agent Hello World — Native Tools
[...] [INFO ] ========================================
[...] [INFO ] Log file: /path/to/logs/run-2026-04-03T12-00-00.log
[...] [INFO ] Config loaded — model: openai/gpt-4o | input: "hello world"
[...] [INFO ] [Orchestrator] Starting
[...] [INFO ] [Orchestrator] Plan: Invoke subagent-no-tool first, then subagent-with-tool.
[...] [INFO ] [Orchestrator] Delegating to subagent-no-tool
[...] [INFO ] [Subagent-NoTool] Output: "HELLO WORLD"
[...] [INFO ] [Orchestrator] Delegating to subagent-with-tool
[...] [INFO ] [Subagent-Tool] LLM called tool: to_uppercase({"text":"hello world"})
[...] [INFO ] [Subagent-Tool] Tool result: "HELLO WORLD"
[...] [INFO ] [Subagent-Tool] Output: "HELLO WORLD"
[...] [INFO ] ========================================
[...] [INFO ]   Result (no tool):   HELLO WORLD
[...] [INFO ]   Result (with tool): HELLO WORLD
[...] [INFO ] ========================================
```

Log files are written to `logs/run-<timestamp>.log` (plain text, no ANSI codes).

---

## Extending

**Add a new tool**

1. Create `src/tools/my-tool.js` with a `SCHEMA` and an `execute` function.
2. Import it in `subagent-with-tool.js` and add it to `TOOL_REGISTRY` and `TOOL_SCHEMAS`.

**Add a new subagent**

1. Create `src/agents/subagent-*.js` following the same `run(config, text)` interface.
2. Add a system prompt under `src/prompts/`.
3. Import and call it from `orchestrator.js`.

---

## License

MIT
