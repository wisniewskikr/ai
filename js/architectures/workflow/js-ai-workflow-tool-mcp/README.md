# js-ai-workflow-tool-mcp

A **Hello World** JavaScript project demonstrating the **workflow architecture** with a real **MCP (Model Context Protocol) server** connected via the OpenRouter API.

## What it does

The workflow runs two steps on the same input text (`"hello world"`):

| Step | Description | Expected output |
|------|-------------|-----------------|
| 1 | Model converts text to uppercase **on its own** (no tools) | `HELLO WORLD` |
| 2 | Model converts text to uppercase **via an MCP server tool** (`to_uppercase`) | `HELLO WORLD` |

All steps are logged to the console (with colors) and to a timestamped file in the `logs/` directory.

## Architecture

```
src/
├── index.js      Entry point — loads .env and config.json, starts the workflow
├── workflow.js   Workflow orchestrator — runs Step 1 and Step 2 sequentially
└── logger.js     Dual-output logger (ANSI colors on console + plain text to file)

mcp-server.js     Standalone MCP Server process — exposes the "to_uppercase" tool
```

### MCP flow (Step 2)

```
workflow.js (MCP Client)
  │
  │  1. spawn as child process (stdio transport)
  ▼
mcp-server.js (MCP Server)
  │
  │  2. listTools()  →  ["to_uppercase"]
  │  3. send tool definitions to LLM (OpenAI format)
  │  4. LLM returns tool_call { name: "to_uppercase", args: { text: "hello world" } }
  │  5. callTool()   →  "HELLO WORLD"
  │  6. send tool result back to LLM
  │  7. LLM returns final text answer
  ▼
  done — mcpClient.close()
```

The MCP server runs as a **real separate process** and communicates with the workflow over **stdin/stdout** using the Model Context Protocol (JSON-RPC). The workflow discovers available tools at runtime via `listTools()` and executes them via `callTool()` — it has no hard-coded knowledge of the tool implementation.

## Prerequisites

- Node.js >= 18
- An [OpenRouter](https://openrouter.ai) API key

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your API key
echo "OPENROUTER_API_KEY=your_key_here" > .env
```

## Configuration

Edit `config.json` to change the model or input text:

```json
{
  "model": "gpt-4o",
  "input": "hello world"
}
```

| Field   | Description                                   |
|---------|-----------------------------------------------|
| `model` | Any chat model available on OpenRouter        |
| `input` | The text the model will convert to uppercase  |

## Run

```bash
npm start
```

### Example console output

```
─── Hello World MCP Workflow ───────────────────────────────
ℹ INFO    Loading configuration...
ℹ INFO    API key loaded from .env
ℹ INFO    Config loaded — model: "gpt-4o", input: "hello world"

─── WORKFLOW START ─────────────────────────────────────────
ℹ INFO    Model   : gpt-4o
ℹ INFO    Input   : "hello world"

─── STEP 1 · Model Only (no tools) ─────────────────────────
ℹ INFO    Asking the model to convert the text to uppercase without any tools...
✔ RESULT  Model answered (no tools): "HELLO WORLD"

─── STEP 2 · Model + MCP Server ────────────────────────────
ℹ INFO    Spawning MCP server (stdio transport)...
ℹ INFO    MCP client connected to server
ℹ INFO    MCP server exposed 1 tool(s): "to_uppercase"
ℹ INFO    Sending request to model with MCP tool definitions...
⚙ TOOL    Model requested MCP tool: "to_uppercase"
⚙ TOOL    Tool arguments: {"text":"hello world"}
⚙ TOOL    MCP server returned: "HELLO WORLD"
✔ RESULT  Model answered (with MCP tool): "HELLO WORLD"
ℹ INFO    MCP client disconnected

─── FINAL RESULTS ──────────────────────────────────────────
✔ RESULT  Step 1 — Model only       : "HELLO WORLD"
✔ RESULT  Step 2 — Model + MCP tool : "HELLO WORLD"
─── WORKFLOW COMPLETE ──────────────────────────────────────
```

## Logs

Each run creates a timestamped plain-text log file:

```
logs/
└── run-2026-04-02T10-00-00.log
```

The `logs/` directory is listed in `.gitignore` and is never committed.

## Key concepts

- **Workflow architecture** — a linear sequence of named steps, each with a clear input and output.
- **MCP Server** — a standalone process (`mcp-server.js`) that exposes tools via the Model Context Protocol. Spawned fresh for each workflow run via `StdioClientTransport`.
- **MCP Client** — connects to the server, calls `listTools()` to discover available tools at runtime, and calls `callTool()` to execute them. The workflow has no hard-coded knowledge of tool implementations.
- **Agentic loop** — the workflow loops until the model stops issuing tool calls and produces a final text response.
