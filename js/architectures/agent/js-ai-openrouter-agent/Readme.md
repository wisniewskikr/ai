# js-ai-openrouter-agent

## Description

A Node.js AI agent that communicates with AI models via the [OpenRouter](https://openrouter.ai) API. The agent supports multi-turn conversations and function calling — it automatically executes tools requested by the model and feeds results back until a final response is produced.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `agent.js` | Agent loop — manages messages, tool calls, and iteration control |
| `app.js` | Entry point — reads config, defines tools, and starts the agent |
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
    "message": "Hello! What can you do?",
    "maxIterations": 10
}
```

`maxIterations` caps the number of model calls the agent will make before throwing an error. This prevents infinite loops in case of unexpected model behaviour.

**4. Add tools (optional)**

Register tools in the `tools` array in `app.js`. Each tool requires a `definition` (sent to the model) and an `execute` function (called when the model uses the tool):

```js
const tools = [
    {
        definition: {
            name: 'get_weather',
            description: 'Get the current weather for a city',
            parameters: {
                type: 'object',
                properties: {
                    city: { type: 'string', description: 'City name' }
                },
                required: ['city']
            }
        },
        execute: async ({ city }) => {
            // fetch and return weather data
            return { temperature: 22, condition: 'sunny' };
        }
    }
];
```

**5. Run the application**

```bash
node app.js
```

The agent will loop, executing any tool calls made by the model, until a final text response is produced. Tool calls and their results are logged to the console as they happen.
