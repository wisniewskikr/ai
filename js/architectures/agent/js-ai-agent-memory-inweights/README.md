# js-ai-agent-tool-mcp

A minimal "Hello World" demonstrating an LLM agent with MCP tool use.

The agent converts a prompt string to uppercase **twice** - once without any
tools (the model does it from general knowledge), and once using a custom MCP
server tool (the model calls an external function). Both runs produce the same
result. The point is to show how the agent loop works, not to do anything useful.

---

## What it does

```
Input:  "hello world"

Phase 1 - Model only:
  agent  -> LLM: "convert to uppercase"
  LLM   -> agent: "HELLO WORLD"

Phase 2 - With MCP tool:
  agent  -> LLM: "convert to uppercase" + [to_uppercase tool available]
  LLM   -> agent: tool_call to_uppercase("hello world")
  agent  -> MCP server: to_uppercase("hello world")
  MCP   -> agent: "HELLO WORLD"
  agent  -> LLM: here is the tool result "HELLO WORLD"
  LLM   -> agent: "HELLO WORLD"

Output: "HELLO WORLD" (x2)
```

---

## Architecture

```
index.js                  - entry point, reads prompt, runs agent
src/
  config.js               - loads config.json + .env
  logger.js               - console + file logging
  agent.js                - orchestrates both phases, runs the tool loop
  mcp-server.js           - standalone MCP server (child process)
logs/                     - daily log files (YYYY-MM-DD.log)
config.json               - model, baseUrl, default input
.env                      - OPENROUTER_API_KEY (never commit this)
```

The MCP server runs as a **separate Node.js child process**. The agent spawns it
via `StdioClientTransport` and communicates over stdin/stdout using the Model
Context Protocol (JSON-RPC). This is intentional - MCP servers are independent
processes, not in-process libraries.

---

## Setup

```bash
npm install
```

Create `.env`:

```
OPENROUTER_API_KEY=sk-or-...
```

---

## Usage

```bash
# Use the default prompt from config.json
npm start

# Pass a custom prompt
node index.js "your text here"
```

---

## Configuration

`config.json`:

| Field         | Default                          | Description                    |
|---------------|----------------------------------|--------------------------------|
| `model`       | `openai/gpt-4o`                  | Model ID on OpenRouter         |
| `maxTokens`   | `1024`                           | Maximum tokens in response     |
| `temperature` | `0`                              | Sampling temperature           |
| `baseUrl`     | `https://openrouter.ai/api/v1`   | OpenAI-compatible API base URL |
| `input`       | `hello world`                    | Default prompt                 |

`.env`:

| Variable              | Required | Description          |
|-----------------------|----------|----------------------|
| `OPENROUTER_API_KEY`  | Yes      | OpenRouter API key   |

---

## Logging

Every run appends to `logs/YYYY-MM-DD.log`. Log levels:

- `INFO`   - general progress
- `STEP`   - start of a major phase
- `TOOL`   - MCP tool call activity
- `RESULT` - final output values
- `WARN`   - unexpected but non-fatal events
- `ERROR`  - fatal problems

---

## MCP tool: `to_uppercase`

Defined in `src/mcp-server.js`. Accepts:

```json
{ "text": "hello world" }
```

Returns:

```json
{ "content": [{ "type": "text", "text": "HELLO WORLD" }] }
```

To add more tools, add entries to the `ListToolsRequestSchema` handler and
corresponding cases in the `CallToolRequestSchema` handler in `mcp-server.js`.

---

## Requirements

- Node.js 18+
- An OpenRouter API key with access to `openai/gpt-4o`
