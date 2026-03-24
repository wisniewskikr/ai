# js-ai-openrouter-agent-mcp-api

## Description

A Node.js AI agent that communicates with AI models via the [OpenRouter](https://openrouter.ai) API. The agent supports multi-turn conversations and function calling — it automatically executes tools requested by the model and feeds results back until a final response is produced.

Tools are provided via a local [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. The app spawns `src/mcp/client.js` as a subprocess, connects to it over stdio, and discovers available tools at runtime.

**File structure:**

| File | Purpose |
|------|---------|
| `src/native/openrouter.js` | Handles all communication with the OpenRouter API |
| `src/native/agent.js` | Agent loop — manages messages, tool calls, and iteration control |
| `src/native/tools.js` | Spawns the MCP server, connects the client, and returns wrapped tools |
| `src/mcp/client.js` | MCP server — registers and exposes tools over stdio |
| `src/tools/userapi.js` | Tool that fetches a random user from the FakerAPI |
| `app.js` | Entry point — reads config and starts the agent |
| `config.json` | Stores the model name, input message, and max iterations |
| `.env` | Stores your OpenRouter API key (never commit this file) |

## Usage

**1. Install Node.js**

Requires Node.js v18 or higher (built-in `fetch` support).

**2. Install dependencies**

```bash
npm install
```

**3. Add your API key**

Replace the placeholder in `.env` with your actual OpenRouter API key:

```
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

**4. Configure the agent**

Edit `config.json` to set your desired model, message, and maximum agent iterations:

```json
{
    "model": "gpt-4o",
    "message": "Get a random user from the FakerAPI",
    "maxIterations": 10
}
```

`maxIterations` caps the number of model calls the agent will make before throwing an error. This prevents infinite loops in case of unexpected model behaviour.

**5. Add tools (optional)**

Place tools in the `src/tools/` directory. Each tool must export a `definition` and an `execute` function:

```js
export const definition = {
    type: 'function',
    name: 'my_tool',
    description: 'What the tool does',
    parameters: {
        type: 'object',
        properties: {},
        required: []
    }
};

export const execute = async () => {
    // fetch and return result
    return { key: 'value' };
};
```

Then register the tool in `src/mcp/client.js`:

```js
import { definition, execute } from '../tools/my_tool.js';

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

**6. Run the application**

```bash
npm run start
```

The app runs the agent twice with the same message:

1. **Without tools** — the model responds based on its own knowledge
2. **With MCP tools** — the model calls the tool via the MCP server to fetch a real random user

Example output:

```
Here is a randomly generated user: John Doe (@johndoe123).
[agent] calling tool "get_random_user" with {}
[agent] tool "get_random_user" returned {"firstname":"Anna","lastname":"Kowalska","username":"anna_kowalska"}
The random user fetched from the FakerAPI is Anna Kowalska, username: anna_kowalska.
```

The agent will loop, executing any tool calls made by the model, until a final text response is produced. Tool calls and their results are logged to the console as they happen.
