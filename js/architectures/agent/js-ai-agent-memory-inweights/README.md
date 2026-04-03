# js-ai-agent-memory-inweights

A minimal "Hello World" demonstrating **in-weights memory** in an LLM agent.

The agent is asked to display "Hello World" plus the user's name. Because it only has
in-weights memory (knowledge baked in during training), it has no personal data about
the user and falls back to `"Hello World, stranger"`.

---

## What it does

```
Input:  "Display text 'Hello World' plus my name."

agent  -> LLM: prompt + system instruction (in-weights memory only)
LLM   -> agent: "Hello World, stranger"  (name unknown — not in training data)

Output: "Hello World, stranger"
```

---

## Architecture

```
main.js                 - entry point, reads prompt, runs agent
src/
  agents/agent.js       - single-phase agent, calls LLM directly
  lib/api.js            - OpenAI-compatible API wrapper
  lib/config.js         - loads config.json + .env
  lib/logger.js         - console + file logging
  prompts/agent.txt     - system prompt
logs/                   - daily log files (YYYY-MM-DD.log)
config.json             - model, baseUrl, default input
.env                    - OPENROUTER_API_KEY (never commit this)
```

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
# Use the default prompt from config.json
npm start

# Pass a custom prompt
node main.js "your prompt here"
```

---

## Configuration

`config.json`:

| Field         | Default                          | Description                    |
|---------------|----------------------------------|--------------------------------|
| `model`       | `openai/gpt-4o`                  | Model ID on OpenRouter         |
| `maxTokens`   | `1024`                           | Maximum tokens in response     |
| `temperature` | `0`                              | Sampling temperature           |
| `baseUrl`     | `https://openrouter.ai/api/v1`   | OpenAI-compatible API base URL |
| `input`       | `Display text 'Hello World' plus my name.` | Default prompt    |

`.env`:

| Variable              | Required | Description          |
|-----------------------|----------|----------------------|
| `OPENROUTER_API_KEY`  | Yes      | OpenRouter API key   |

---

## Logging

Every run appends to `logs/YYYY-MM-DD.log`. Log levels:

- `INFO`   - general progress
- `STEP`   - start of a major phase
- `RESULT` - final output value
- `WARN`   - unexpected but non-fatal events
- `ERROR`  - fatal problems

---

## Requirements

- Node.js 18+
- An OpenRouter API key with access to `openai/gpt-4o`
