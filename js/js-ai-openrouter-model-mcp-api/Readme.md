# js-ai-openrouter-model-mcp-custom

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
| `tools/uppercase.js` | Tool reference (logic lives in `mcp-server.js`) |

## How it works

Instead of importing tools directly, `model.js` starts `mcp-server.js` as a subprocess and communicates with it over stdio using the MCP protocol:

1. `model.js` connects to `mcp-server.js` via `StdioClientTransport`
2. It calls `client.listTools()` to discover available tools — no direct imports
3. Tool definitions are forwarded to the AI via the OpenRouter API
4. When the AI responds with `tool_calls`, `model.js` calls `client.callTool()` to execute them through the MCP server
5. The tool result is appended to the conversation and sent back for a final response

```
model.js  <--stdio-->  mcp-server.js  (exposes: uppercase)
    |
    v
OpenRouter API  (tool definitions from MCP)
```

## Conversation flow

**First call** — message sent **without** tools. The model answers on its own:

```json
{
  "role": "assistant",
  "content": "HELLO, WORLD!",
  "refusal": null,
  "reasoning": null
}
```

**Second call** — message sent **with** tools discovered via MCP. If the model decides to delegate:

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "type": "function",
      "id": "call_...",
      "function": { "name": "uppercase", "arguments": "{\"text\":\"hello, world!\"}" }
    }
  ]
}
```

The tool is executed via `client.callTool()` on the MCP server, and the result is sent back for a final answer.

## Adding a custom tool

Add a new tool in `mcp-server.js` using `server.registerTool()`:

```js
server.registerTool(
    'my_tool',
    {
        description: 'What this tool does',
        inputSchema: { input: z.string() },
    },
    async ({ input }) => ({
        content: [{ type: 'text', text: /* your logic */ input }],
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
    "message": "Convert the text 'hello world' to uppercase."
}
```

**5. Run the application**

```bash
node model.js
```
