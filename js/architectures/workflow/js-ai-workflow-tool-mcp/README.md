# js-ai-workflow-tool-mcp

A **Hello World** JavaScript project demonstrating the **workflow architecture** with **MCP (Model Context Protocol) tools** via the OpenRouter API.

## What it does

The workflow runs two steps on the same input text (`"hello world"`):

| Step | Description | Expected output |
|------|-------------|-----------------|
| 1 | Model converts text to uppercase **on its own** (no tools) | `HELLO WORLD` |
| 2 | Model converts text to uppercase **using an MCP tool** (`to_uppercase`) | `HELLO WORLD` |

All steps are logged to the console (with colors) and to a timestamped file in the `logs/` directory.

## Architecture

```
src/
├── index.js      Entry point — loads .env and config.json, then starts the workflow
├── workflow.js   Workflow orchestrator — runs Step 1 and Step 2 sequentially
├── tools.js      MCP tool definitions (JSON schema) and local tool handlers
└── logger.js     Dual-output logger (console with ANSI colors + plain-text file)
```

### Workflow diagram

```
index.js
  └─ runWorkflow()
       ├─ step1ModelOnly()   →  model answers directly (no tools)
       └─ step2ModelWithMCP()
              ├─ send request with tool definitions
              ├─ model calls "to_uppercase" tool  ← agentic loop
              ├─ execute tool locally
              ├─ send tool result back to model
              └─ model returns final answer
```

## Prerequisites

- Node.js >= 18
- An [OpenRouter](https://openrouter.ai) API key

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your API key in .env
echo "OPENROUTER_API_KEY=your_key_here" > .env
```

## Configuration

Edit `config.json` to change the model or the input text:

```json
{
  "model": "gpt-4o",
  "input": "hello world"
}
```

| Field   | Description                              |
|---------|------------------------------------------|
| `model` | Any model available on OpenRouter        |
| `input` | The text the model will convert to uppercase |

## Run

```bash
npm start
```

### Example console output

```
─── Hello World MCP Workflow ────────────────────────────────
ℹ INFO    Loading configuration...
ℹ INFO    API key loaded from .env
ℹ INFO    Config loaded  — model: "gpt-4o", input: "hello world"

─── STEP 1 · Model Only (no tools) ─────────────────────────
ℹ INFO    Input: "hello world"
ℹ INFO    Asking the model to convert the text to uppercase without any tools...
✔ RESULT  Model answered (no tools): "HELLO WORLD"

─── STEP 2 · Model + MCP Tool ───────────────────────────────
ℹ INFO    Input: "hello world"
ℹ INFO    Available MCP tool: "to_uppercase"
ℹ INFO    Asking the model to convert the text using the MCP tool...
⚙ TOOL    Model requested tool: "to_uppercase"
⚙ TOOL    Tool arguments: {"text":"hello world"}
⚙ TOOL    Tool execution result: "HELLO WORLD"
✔ RESULT  Model answered (with MCP tool): "HELLO WORLD"

─── FINAL RESULTS ───────────────────────────────────────────
✔ RESULT  Step 1 — Model only      : "HELLO WORLD"
✔ RESULT  Step 2 — Model + MCP tool: "HELLO WORLD"
─── WORKFLOW COMPLETE ───────────────────────────────────────
```

## Logs

Each run produces a plain-text log file:

```
logs/
└── run-2026-04-02T10-00-00.log
```

The `logs/` directory is listed in `.gitignore` and is never committed.

## Key concepts

- **Workflow architecture** — the program is a linear sequence of named steps, each with a clear input and output.
- **MCP tool** — a function exposed to the model via a JSON schema. The model decides when to call it; the local code executes it and returns the result.
- **Agentic loop** — Step 2 loops until the model stops requesting tool calls and produces a final text response.
