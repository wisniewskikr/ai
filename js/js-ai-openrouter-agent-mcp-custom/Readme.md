# js-ai-openrouter-agent-mcp-custom

## Description

A Node.js AI agent that communicates with AI models via the [OpenRouter](https://openrouter.ai) API. The agent supports multi-turn conversations and function calling — it automatically executes tools requested by the model and feeds results back until a final response is produced.

Tools are provided via a local [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. The app spawns `mcp-server.js` as a subprocess, connects to it over stdio, and discovers available tools at runtime.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `agent.js` | Agent loop — manages messages, tool calls, and iteration control |
| `app.js` | Entry point — reads config and starts the agent |
| `tools.js` | Spawns the MCP server, connects the client, and returns wrapped tools |
| `mcp-server.js` | MCP server — registers and exposes tools over stdio |
| `tools/uppercase.js` | Tool that converts a string to uppercase |
| `config.json` | Stores the model name, input message, and max iterations |
| `.key` | Stores your OpenRouter API key (never commit this file) |

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

**4. Configure the agent**

Edit `config.json` to set your desired model, message, and maximum agent iterations:

```json
{
    "model": "gpt-4o",
    "message": "Convert the following text to uppercase: Hello, world!",
    "maxIterations": 10
}
```

`maxIterations` caps the number of model calls the agent will make before throwing an error. This prevents infinite loops in case of unexpected model behaviour.

**5. Add tools (optional)**

Place tools in the `tools/` directory. Each tool must export a `definition` and an `execute` function:

```js
export const definition = {
    type: 'function',
    name: 'my_tool',
    description: 'What the tool does',
    parameters: {
        type: 'object',
        properties: {
            input: { type: 'string' }
        },
        required: ['input']
    }
};

export const execute = ({ input }) => {
    // process and return result
    return input;
};
```

Then register the tool in `mcp-server.js`:

```js
import { definition, execute } from './tools/my_tool.js';
import { z } from 'zod';

server.registerTool(
    definition.name,
    {
        description: definition.description,
        inputSchema: { input: z.string() },
    },
    async (args) => ({
        content: [{ type: 'text', text: execute(args) }],
    })
);
```

**6. Run the application**

```bash
node app.js
```

The app runs the agent twice with the same message:

1. **Without tools** — the model uppercases the text on its own
2. **With MCP tools** — the model calls the tool via the MCP server to uppercase the text

Example output:

```
HELLO, WORLD!
[agent] calling tool "uppercase" with { text: 'Hello, world!' }
[agent] tool "uppercase" returned HELLO, WORLD!
The text "Hello, world!" converted to uppercase is "HELLO, WORLD!".
```

The agent will loop, executing any tool calls made by the model, until a final text response is produced. Tool calls and their results are logged to the console as they happen.
