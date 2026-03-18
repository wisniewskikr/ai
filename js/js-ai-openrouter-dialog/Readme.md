# js-ai-openrouter-model

## Description

A minimal Node.js application demonstrating how to call an AI model via the [OpenRouter](https://openrouter.ai) API. The input messages and model are read from a configuration file, and the AI response is printed to the console.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `main.js` | Entry point — reads config and displays the AI response |
| `config.json` | Stores the model name and input messages |
| `.key` | Stores your OpenRouter API key (never commit this file) |

## Usage

**1. Install Node.js**

Requires Node.js v18 or higher (built-in `fetch` support).

**2. Add your API key**

Replace the placeholder in `.key` with your actual OpenRouter API key:

```
sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

**3. Configure the messages and model**

This demo makes two sequential calls and preserves conversation history between them.

Edit `config.json` to set your desired model and messages:

```json
{
    "model": "gpt-4o",
    "messageFirst": "My name is Chris",
    "messageSecond": "What is my name?"
}
```

**4. Run the application**

```bash
node main.js
```

The AI response (from the second call) will be printed to the console. With the example config, it should answer `What is my name?`.
