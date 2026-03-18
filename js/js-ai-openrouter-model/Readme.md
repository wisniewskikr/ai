# js-ai-openrouter-model

## Description

A minimal Node.js application demonstrating how to call an AI model via the [OpenRouter](https://openrouter.ai) API. The input message and model are read from a configuration file, and the AI response is printed to the console.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API |
| `main.js` | Entry point — reads config and displays the AI response |
| `config.json` | Stores the model name and input message |
| `.key` | Stores your OpenRouter API key (never commit this file) |

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
    "message": "Hello! What can you do?"
}
```

**4. Run the application**

```bash
node main.js
```

The AI response will be printed to the console.
