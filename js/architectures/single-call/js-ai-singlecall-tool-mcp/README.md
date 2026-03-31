# js-ai-singlecall-tool-mcp

A "Hello World" example of the **single-call architecture** with **MCP tool use**.

## What it does

1. Reads the `prompt` and `model` from `config.json`.
2. Sends a **single request** to the model, exposing the `to_uppercase` MCP tool.
3. The model responds with a **tool-call request** (it does not return plain text).
4. The application logs the requested function name and its arguments.
5. The tool is **not executed** – this is the key property of the single-call pattern.

```
User prompt → Model → Tool-call request (logged) → Done
```

## Architecture: Single Call

| Property | Value |
|---|---|
| Number of LLM calls | **1** |
| Tool execution | **No** |
| Agentic loop | **No** |

The model acts as a **router**: it reads the user's intent and decides which tool should be called and with what arguments. The caller logs this decision but does not act on it further.

## Project structure

```
.
├── index.js        # Main entry point
├── config.json     # Prompt and model configuration
├── package.json
├── .env            # API keys (not committed)
└── logs/           # Log files (auto-created)
    ├── app.log
    └── error.log
```

## Configuration

**`config.json`**
```json
{
  "prompt": "Convert the following text to uppercase using the to_uppercase tool: \"hello world\"",
  "model": "gpt-4o"
}
```

**`.env`**
```
OPENROUTER_API_KEY=your_key_here
```

The project uses [OpenRouter](https://openrouter.ai) as the API gateway (OpenAI-compatible).

## MCP tool definition

```json
{
  "name": "to_uppercase",
  "description": "Converts the given text to uppercase letters.",
  "parameters": {
    "text": "string – the text to convert"
  }
}
```

## Setup

```bash
npm install
npm start
```

## Expected console output

```
[2026-03-31 17:00:00] INFO  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-03-31 17:00:00] INFO    Single-Call Architecture – MCP Tool Use Demo
[2026-03-31 17:00:00] INFO  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2026-03-31 17:00:00] INFO  Step 1/4 · Loading config.json …
[2026-03-31 17:00:00] INFO            model  : gpt-4o
[2026-03-31 17:00:00] INFO            prompt : Convert the following text to uppercase …
[2026-03-31 17:00:00] INFO  Step 2/4 · Initialising OpenAI client (OpenRouter) …
[2026-03-31 17:00:00] INFO  Step 3/4 · Sending request to the model …
[2026-03-31 17:00:00] INFO            Available tools : to_uppercase
[2026-03-31 17:00:01] INFO  Step 4/4 · Inspecting model response …
[2026-03-31 17:00:01] INFO  ──────────────────────────────────────────────────────
[2026-03-31 17:00:01] INFO    Model requested a tool call  ✓
[2026-03-31 17:00:01] INFO    Function : to_uppercase
[2026-03-31 17:00:01] INFO    Arguments: {"text":"hello world"}
[2026-03-31 17:00:01] INFO  ──────────────────────────────────────────────────────
[2026-03-31 17:00:01] INFO    (Single-call demo – tool is NOT executed)
[2026-03-31 17:00:01] INFO  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
