# js-ai-agent-memory-incontext

A minimal "Hello World" demonstrating **in-context memory** in an LLM agent.

The agent runs a two-turn conversation. In the first turn the user introduces
themselves (`"My name is Chris"`). In the second turn the agent is asked to
display `"Hello World"` plus the user's name. Because the full conversation
history is passed to the model each time, it can recall the name from the
context window and answer correctly.

---

## What it does

```
Turn 1 — user:      "My name is Chris"
Turn 1 — assistant: "Nice to meet you, Chris!"

Turn 2 — user:      "Display text 'Hello World' plus my name."
Turn 2 — assistant: "Hello World, Chris"   ← name recalled from context
```

The key difference from **in-weights memory**: the model was not trained on
this fact — it simply has access to the earlier part of the conversation
(the context window) when answering the second question.

---

## Architecture

```
main.js                   - entry point; loops through inputs, passes history
src/
  agents/agent.js         - one turn per call; grows the history array
  lib/api.js              - OpenAI-compatible API wrapper
  lib/config.js           - loads config.json + .env
  lib/logger.js           - console + file logging
  prompts/agent.txt       - system prompt
logs/                     - daily log files (YYYY-MM-DD.log)
config.json               - model, baseUrl, default inputs
.env                      - OPENROUTER_API_KEY (never commit this)
```

---

## Dependencies

| Package  | Purpose                        |
|----------|--------------------------------|
| `dotenv` | Load `OPENROUTER_API_KEY` from `.env` |

### How in-context memory works

```
Turn 1                          Turn 2
──────────────────────────      ──────────────────────────────────────────
[system]                        [system]
[user]  "My name is Chris"      [user]  "My name is Chris"
                                [assistant] "Nice to meet you, Chris!"
                        →       [user]  "Display text 'Hello World' plus my name."
```

Each call to `agent.run()` receives the accumulated history and appends the new
user message + assistant reply before returning the updated array.

---

## Setup

```bash
npm install
```

Create `.env`:

```
OPENROUTER_API_KEY=sk-or-...
```

---

## Usage

```bash
# Use the default inputs from config.json
npm start

# Pass custom turns as CLI arguments
node main.js "My name is Alice" "Display text 'Hello World' plus my name."
```

---

## Configuration

`config.json`:

| Field         | Default                        | Description                        |
|---------------|--------------------------------|------------------------------------|
| `model`       | `openai/gpt-4o`                | Model ID on OpenRouter             |
| `maxTokens`   | `1024`                         | Maximum tokens in response         |
| `temperature` | `0`                            | Sampling temperature               |
| `baseUrl`     | `https://openrouter.ai/api/v1` | OpenAI-compatible API base URL     |
| `inputs`      | `["My name is Chris", "Display text 'Hello World' plus my name."]` | Ordered list of conversation turns |

`.env`:

| Variable             | Required | Description        |
|----------------------|----------|--------------------|
| `OPENROUTER_API_KEY` | Yes      | OpenRouter API key |

---

## Logging

Every run appends to `logs/YYYY-MM-DD.log`. Log levels:

- `INFO`   - general progress
- `STEP`   - start of a new conversation turn
- `RESULT` - assistant reply
- `WARN`   - unexpected but non-fatal events
- `ERROR`  - fatal problems

---

## Requirements

- Node.js 18+
- An OpenRouter API key with access to `openai/gpt-4o`
