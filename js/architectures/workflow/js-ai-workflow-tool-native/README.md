# js-ai-workflow-tool-native

A **Hello World** example of a **workflow architecture** using native LLM tool calling (no MCP). The workflow takes a text prompt and converts it to uppercase in two distinct ways:

1. **Without tools** — the model answers directly from its own knowledge.
2. **With tools** — the model calls a native `to_uppercase` function, receives the result, and returns the final answer.

Both steps produce `HELLO WORLD`.

---

## Architecture

```
index.js  (entry point)
│
├── config.json         ← prompt + model name
├── .env                ← OPENROUTER_API_KEY
│
└── src/
    ├── api.js          ← OpenRouter REST client (native fetch)
    ├── tools.js        ← tool definitions + local implementations
    ├── workflow.js     ← Step 1 (no tools) + Step 2 (with tools)
    └── logger.js       ← console + file logger
```

### Workflow steps

| Step | Description | API calls |
|------|-------------|-----------|
| 1 | Model converts text to uppercase directly | 1 |
| 2 | Model calls `to_uppercase` tool, result sent back, model returns final answer | 2 |

---

## Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

---

## Setup

```bash
npm install
```

Create a `.env` file (already present, update the key if needed):

```
OPENROUTER_API_KEY=your-key-here
```

Edit `config.json` to change the prompt or model:

```json
{
  "prompt": "hello world",
  "model": "anthropic/claude-sonnet-4-5"
}
```

---

## Run

```bash
npm start
```

### Example output

```
────────────────────────────────────────────────────────────
[INFO] ℹ️  Workflow: Hello World — Uppercase Converter
[INFO] ℹ️  Model   : anthropic/claude-sonnet-4-5
[INFO] ℹ️  Input   : "hello world"
────────────────────────────────────────────────────────────

[STEP] ➡️  STEP 1 — Model converts to uppercase WITHOUT tools
[INFO] ℹ️  Sending prompt to model: "hello world"
[SUCCESS] ✅ Model responded without using any tools.
[RESULT] 🎯 Output: "HELLO WORLD"
────────────────────────────────────────────────────────────

[STEP] ➡️  STEP 2 — Model converts to uppercase WITH tools
[INFO] ℹ️  Sending prompt to model with tool definitions: "hello world"
[INFO] ℹ️  Model requested tool call: to_uppercase({"text":"hello world"})
[INFO] ℹ️  Tool executed locally → result: "HELLO WORLD"
[SUCCESS] ✅ Model processed tool result and returned final answer.
[RESULT] 🎯 Output: "HELLO WORLD"
────────────────────────────────────────────────────────────

[STEP] ➡️  FINAL RESULTS
[RESULT] 🎯 Without tools: "HELLO WORLD"
[RESULT] 🎯 With tools   : "HELLO WORLD"
────────────────────────────────────────────────────────────
[SUCCESS] ✅ Workflow completed successfully.
```

---

## Logs

Each run appends to a daily log file in the `logs/` directory:

```
logs/workflow-2026-04-02.log
```

The `logs/` directory is excluded from git via `.gitignore`.

---

## Native tool: `to_uppercase`

| Property | Value |
|----------|-------|
| Name | `to_uppercase` |
| Input | `text` (string) |
| Output | Uppercase version of the input string |
| Implementation | `text.toUpperCase()` in `src/tools.js` |
