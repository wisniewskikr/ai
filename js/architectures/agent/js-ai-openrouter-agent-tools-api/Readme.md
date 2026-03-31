# js-ai-openrouter-agent-tools-api

## Description

A Node.js AI agent that communicates with AI models via the [OpenRouter](https://openrouter.ai) API. The agent supports multi-turn conversations and function calling — it automatically executes tools requested by the model and feeds results back until a final response is produced.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `agent.js` | Agent loop — manages messages, tool calls, and iteration control |
| `app.js` | Entry point — reads config, defines tools, and starts the agent |
| `tools/userapi.js` | Tool that fetches a random user from the FakerAPI |
| `config.json` | Stores the model name, input message, and max iterations |
| `.key` | Stores your OpenRouter API key (never commit this file) |

## Usage

**1. Install Node.js**

Requires Node.js v18 or higher (built-in `fetch` support).

**2. Add your API key**

Replace the placeholder in `.key` with your actual OpenRouter API key:

```
sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

**3. Configure the agent**

Edit `config.json` to set your desired model, message, and maximum agent iterations:

```json
{
    "model": "gpt-4o",
    "message": "Get a random user from the FakerAPI",
    "maxIterations": 10
}
```

`maxIterations` caps the number of model calls the agent will make before throwing an error. This prevents infinite loops in case of unexpected model behaviour.

**4. Add tools (optional)**

Place tools in the `tools/` directory. Each tool must export a `definition` (sent to the model) and an `execute` function (called when the model uses the tool):

```js
const definition = {
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

const execute = ({ input }) => {
    // process and return result
    return input;
};

module.exports = { definition, execute };
```

Then import and pass the tool to `runAgent` in `app.js`:

```js
const myTool = require('./tools/my_tool');

const response = await runAgent(model, message, [myTool], maxIterations);
```

**5. Run the application**

```bash
node app.js
```

The app runs the agent twice with the same message:

1. **Without tools** — the model answers on its own
2. **With the `get_random_user` tool** — the model calls the tool to fetch a random user from the FakerAPI

Example output:

```
To get a random user from the FakerAPI, you can use a HTTP client to make a request to the API endpoint provided by FakerAPI or a similar service. If yougramming language like Python, you can use the `requests` library for this purpose.
[agent] calling tool "get_random_user" with {}
[agent] tool "get_random_user" returned { firstname: 'Maks', lastname: 'Wysocki', username: 'kucharski.dawid' }
Here is a random user from the FakerAPI:

- **First Name:** Maks
- **Last Name:** Wysocki
- **Username:** kucharski.dawid
```

The agent will loop, executing any tool calls made by the model, until a final text response is produced. Tool calls and their results are logged to the console as they happen.
