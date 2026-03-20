# js-ai-openrouter-model-tools-custom

## Description

A minimal Node.js application demonstrating how to call an AI model via the [OpenRouter](https://openrouter.ai) API with **custom tool support**. The model can invoke locally-defined tools during a conversation, and the results are fed back for a final response.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `model.js` | Entry point — reads config, runs the conversation loop |
| `config.json` | Stores the model name and input message |
| `.key` | Stores your OpenRouter API key (never commit this file) |
| `tools/sum.js` | Tool: returns the sum of two numbers |
| `tools/uppercase.js` | Tool: converts a string to uppercase |

## How tools work

Each tool file exports two things:

- `definition` — describes the tool to the AI (name, description, parameters)
- `execute` — the local function that runs when the AI calls the tool

The conversation flow:

1. **First call** — the user message is sent **without** tools. The model performs the task on its own (e.g. uppercasing by itself). Expected response:

```json
{
  "role": "assistant",
  "content": "HELLO, WORLD!",
  "refusal": null,
  "reasoning": null
}
```

2. **Second call** — the same message is sent **with** tool definitions. The model now delegates the work to the `uppercase` tool instead of doing it itself. Expected response:

```json
{
  "role": "assistant",
  "content": null,
  "refusal": null,
  "reasoning": null,
  "tool_calls": [
    {
      "type": "function",
      "index": 0,
      "id": "call_LfkctD3VZfREScI6wI5IgxDW",
      "function": { "name": "uppercase", "arguments": "{\"text\":\"hello, world!\"}" }
    }
  ]
}
```

3. The tool is executed locally and the result is sent back for a final answer.

## Adding a custom tool

Create a new file in `tools/`, following this pattern:

```js
export const definition = {
    type: "function",
    name: "my_tool",
    description: "What this tool does",
    parameters: {
        type: "object",
        properties: {
            input: { type: "string" }
        },
        required: ["input"],
        additionalProperties: false
    }
};

export const execute = ({ input }) => /* your logic here */;
```

Then import and add it to the `tools` array in `model.js`.

## Usage

**1. Install Node.js**

Requires Node.js v18 or higher (built-in `fetch` support).

**2. Add your API key**

Replace the placeholder in `.key` with your actual OpenRouter API key:

```
sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

**3. Configure the message and model**

Edit `config.json` to set your desired model and message:

```json
{
    "model": "gpt-4o",
    "message": "Convert the text 'hello world' to uppercase."
}
```

**4. Run the application**

```bash
node model.js
```

The AI response will be printed to the console.
