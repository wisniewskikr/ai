# js-ai-openrouter-model-mcp-api

## Description

A minimal Node.js application demonstrating how to call an AI model via the [OpenRouter](https://openrouter.ai) API where tools are exposed through an **MCP (Model Context Protocol) server** rather than imported directly into the model code.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `model.js` | Entry point — connects to MCP server, discovers tools, runs the conversation loop |
| `mcp-server.js` | MCP server exposing tools over stdio |
| `config.json` | Stores the model name and input message |
| `.key` | Stores your OpenRouter API key (never commit this file) |
| `tools/userapi.js` | Tool definition and execution logic for `get_random_user` |

## How it works

Instead of importing tools directly, `model.js` starts `mcp-server.js` as a subprocess and communicates with it over stdio using the MCP protocol:

1. `model.js` connects to `mcp-server.js` via `StdioClientTransport`
2. It calls `client.listTools()` to discover available tools — no direct imports
3. Tool definitions are forwarded to the AI via the OpenRouter API
4. When the AI responds with `tool_calls`, `model.js` calls `client.callTool()` to execute them through the MCP server
5. The tool result is appended to the conversation and sent back for a final response

```
model.js  <--stdio-->  mcp-server.js  (exposes: get_random_user)
    |
    v
OpenRouter API  (tool definitions from MCP)
```

## Conversation flow

**First call** — message sent **without** tools. The model answers on its own:

```
--- Response without tools ---
{
  role: 'assistant',
  content: "To get a random user using the Faker library, you first need to install the Faker library, if you haven't already
...
}
```

**Second call** — message sent **with** tools discovered via MCP. The model calls `get_random_user`, the result is sent back, and the model returns a final answer:

```
--- Response with tools via MCP ---
{
  role: 'assistant',
  content: 'Here is a random user generated from the FakerAPI:\n' +
    '\n' +
    '- **First Name:** Kacper\n' +
    '- **Last Name:** Rutkowska\n' +
    '- **Username:** gajewski.mateusz',
  refusal: null,
  reasoning: null
}
```

The tool is executed via `client.callTool()` on the MCP server, and the result is sent back for a final answer.

## Adding a custom tool

Create a new file in `tools/` exporting `definition` and `execute`, then import and register it in `mcp-server.js`:

```js
import { definition, execute } from './tools/mytool.js';

server.registerTool(
    definition.name,
    {
        description: definition.description,
        inputSchema: {},
    },
    async () => ({
        content: [{ type: 'text', text: JSON.stringify(await execute()) }],
    })
);
```

## Usage

**1. Install Node.js**

Requires Node.js v18 or higher (built-in `fetch` support).

**2. Install dependencies**

```bash
npm install
```

**3. Add your API key**

Replace the placeholder in `.key` with your actual OpenRouter API key:

```
sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

**4. Configure the message and model**

Edit `config.json`:

```json
{
    "model": "gpt-4o",
    "message": "Get me a random user."
}
```

**5. Run the application**

```bash
node model.js
```
