# js-ai-agent-memory-external

A minimal demo showing an LLM agent that uses **external memory** (a local file) via MCP tools.

The agent reads `memory.txt` on every run. If the file is missing or empty it greets a
stranger and writes a name to memory. On subsequent runs it reads the stored name and
greets by name. Run `npm run reset` to delete the memory file and repeat the demo.

---

## What it does

```
First run (memory.txt missing or empty):

  agent  -> LLM: "Display text 'Hello World' plus my name"
  LLM   -> agent: tool_call read_memory()
  agent  -> MCP server: read_memory()
  MCP   -> agent: ""
  LLM   -> agent: tool_call write_memory("My name is Chris")
  agent  -> MCP server: write_memory("My name is Chris")
  MCP   -> agent: "Memory saved."
  LLM   -> agent: "Hello World stranger"

Output: Hello World stranger
memory.txt: "My name is Chris"

---

Second run (memory.txt exists):

  agent  -> LLM: "Display text 'Hello World' plus my name"
  LLM   -> agent: tool_call read_memory()
  agent  -> MCP server: read_memory()
  MCP   -> agent: "My name is Chris"
  LLM   -> agent: "Hello World Chris"

Output: Hello World Chris
```

---

## Architecture

```
main.js                       - entry point, loads config, runs agent, prints greeting
src/
  agents/
    agent.js                  - agentic loop: calls MCP tools, drives the LLM
  lib/
    api.js                    - OpenAI-compatible chat completion wrapper
    config.js                 - loads config.json + .env
    logger.js                 - console + file logging
    mcp-client.js             - spawns MCP server, returns connected client
  mcp/
    server.js                 - MCP server exposing read_memory / write_memory tools
  prompts/
    agent.txt                 - system prompt
logs/                         - daily log files (YYYY-MM-DD.log)
memory.txt                    - external memory (created at runtime, gitignored)
config.json                   - model, baseUrl, default input
.env                          - OPENROUTER_API_KEY (never commit this)
```

The MCP server runs as a **separate Node.js child process**. The agent spawns it via
`StdioClientTransport` and communicates over stdin/stdout using the Model Context
Protocol (JSON-RPC).

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
# Run the agent (uses default prompt from config.json)
npm start

# Reset the demo by deleting memory.txt
npm run reset
```

---

## Configuration

`config.json`:

| Field         | Default                                      | Description                    |
|---------------|----------------------------------------------|--------------------------------|
| `model`       | `openai/gpt-4o`                              | Model ID on OpenRouter         |
| `maxTokens`   | `1024`                                       | Maximum tokens in response     |
| `temperature` | `0`                                          | Sampling temperature           |
| `baseUrl`     | `https://openrouter.ai/api/v1`               | OpenAI-compatible API base URL |
| `input`       | `Display text 'Hello World' plus my name`    | Default prompt                 |

`.env`:

| Variable             | Required | Description        |
|----------------------|----------|--------------------|
| `OPENROUTER_API_KEY` | Yes      | OpenRouter API key |

---

## MCP tools

Defined in `src/mcp/server.js`.

### `read_memory`

Reads `memory.txt`. Returns its content, or an empty string if the file is missing or blank.

```json
{}
```

### `write_memory`

Writes text to `memory.txt`, overwriting any existing content.

```json
{ "text": "My name is Chris" }
```

---

## Logging

Every run appends to `logs/YYYY-MM-DD.log`. Log levels:

- `INFO`   - general progress
- `STEP`   - start of a major phase
- `TOOL`   - MCP tool call activity
- `RESULT` - final output value
- `WARN`   - unexpected but non-fatal events
- `ERROR`  - fatal problems

---

## Requirements

- Node.js 18+
- An OpenRouter API key with access to `openai/gpt-4o`
