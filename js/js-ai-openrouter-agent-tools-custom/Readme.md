# js-ai-openrouter-agent-tools-custom

## Description

A Node.js AI agent that communicates with AI models via the [OpenRouter](https://openrouter.ai) API. The agent supports multi-turn conversations and function calling — it automatically executes tools requested by the model and feeds results back until a final response is produced.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `agent.js` | Agent loop — manages messages, tool calls, and iteration control |
| `app.js` | Entry point — reads config, defines tools, and starts the agent |
| `tools/uppercase.js` | Tool that converts a string to uppercase |
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
    "message": "Convert the following text to uppercase: Hello, world!",
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

1. **Without tools** — the model uppercases the text on its own
2. **With the `uppercase` tool** — the model calls the tool to uppercase the text

Example output:

```
HELLO, WORLD!
[agent] calling tool "uppercase" with { text: 'Hello, world!' }
[agent] tool "uppercase" returned HELLO, WORLD!
The text "Hello, world!" converted to uppercase is "HELLO, WORLD!".
```

The agent will loop, executing any tool calls made by the model, until a final text response is produced. Tool calls and their results are logged to the console as they happen.
