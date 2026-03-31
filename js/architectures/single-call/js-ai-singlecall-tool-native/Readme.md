# js-ai-singlecall-tool-native

A **Hello World** example of the **Single Call** architecture using **native tool use** (function calling) with an OpenAI-compatible API (OpenRouter).

## What it does

1. Reads `text` and `model` from `config.json`
2. Sends a single request to the model with a tool definition: `to_uppercase`
3. The model decides to call `to_uppercase("hello world")`
4. The tool executes locally and returns `"HELLO WORLD"`
5. Every step is logged to the console (with colors) and to a daily log file in `logs/`

## Architecture

```
index.js
  │
  ├─ Read config.json  ──►  { text: "hello world", model: "gpt-4o" }
  │
  ├─ Build API request with tool definition
  │      tool: to_uppercase(text: string) → string
  │
  ├─ POST /chat/completions  (single call, tool_choice: "required")
  │      ▼
  │   Model returns tool_call { name: "to_uppercase", args: { text: "hello world" } }
  │
  ├─ Execute tool locally  →  "HELLO WORLD"
  │
  └─ Log result & print to console
```

## Project structure

```
.
├── config.json      # Model and input text configuration
├── index.js         # Main entry point
├── package.json
├── .env             # API key (not committed)
├── .gitignore
├── Readme.md
└── logs/            # Daily log files (YYYY-MM-DD.log), auto-created
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API key

Create or edit `.env`:

```
OPENROUTER_API_KEY=your-api-key-here
```

Get a free key at [openrouter.ai](https://openrouter.ai).

### 3. (Optional) Edit `config.json`

```json
{
  "text": "hello world",
  "model": "gpt-4o"
}
```

Change `text` to any string you want to convert to uppercase.

## Run

```bash
npm start
```

### Expected output

```
[2026-03-31T...] [INFO ] Starting single-call tool-native example
[2026-03-31T...] [INFO ] Loaded config
[2026-03-31T...] [INFO ] Input text: "hello world"
[2026-03-31T...] [INFO ] Sending request to model
[2026-03-31T...] [INFO ] Received response from model
[2026-03-31T...] [TOOL ] Executing tool: to_uppercase
──────────────────────────────────────────────────
  Result: HELLO WORLD
──────────────────────────────────────────────────
[2026-03-31T...] [OK   ] Final result: "HELLO WORLD"
[2026-03-31T...] [INFO ] Done. Log written to: logs/2026-03-31.log
```

## Key concepts

| Concept | Description |
|---|---|
| **Single call** | Only one HTTP request is sent to the model |
| **Native tool** | Tool schema is passed directly in the API request (`tools` field) — no framework wrapping |
| **tool_choice: "required"** | Forces the model to use a tool instead of a plain text reply |
| **Local execution** | The tool runs in Node.js; the model only decides *which* tool and *with what arguments* |
