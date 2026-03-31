# js-ai-singlecall-tool-native

A **Hello World** example of the **Single Call** architecture using **native tool use** (function calling) with an OpenAI-compatible API (OpenRouter).

## What it does

1. Reads `text` (the prompt) and `model` from `config.json`
2. Sends a **single request** to the model with a tool definition: `to_uppercase`
3. Displays the tool call the model wants to make — name and arguments
4. **Does not execute the tool** — the purpose is to show how the model responds to a native tool definition

## Architecture

```
index.js
  │
  ├─ Read config.json  ──►  { text: "...", model: "gpt-4o" }
  │
  ├─ Build API request with tool definition
  │      tool: to_uppercase(text: string) → string
  │
  └─ POST /chat/completions  (single call, tool_choice: "required")
         ▼
      Model returns tool_call:
        { name: "to_uppercase", arguments: { text: "hello world" } }
         ▼
      Display result — no execution
```

## Project structure

```
.
├── config.json      # Prompt and model configuration
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
  "text": "Convert the following text to uppercase using the to_uppercase tool: \"hello world\"",
  "model": "gpt-4o"
}
```

`text` is the prompt sent directly to the model. Change it to anything you want to try.

## Run

```bash
npm start
```

### Expected output

```
[INFO ] Starting single-call tool-native example
[INFO ] Loaded config
[INFO ] Input text: "Convert the following text to uppercase..."
[INFO ] Sending request to model
[INFO ] Received response from model

▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
[CALL ] Model wants to call tool: to_uppercase
  {
    "tool_call_id": "call_...",
    "arguments": { "text": "hello world" }
  }
▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶

[INFO ] Single call complete — tool was NOT executed (by design)
[INFO ] Done. Log written to: logs/YYYY-MM-DD.log
```

## Log levels

| Level | Color   | Meaning                                  |
|-------|---------|------------------------------------------|
| INFO  | Cyan    | General progress steps                   |
| CALL  | Magenta | Tool call requested by the model         |
| OK    | Green   | Successful final result                  |
| ERROR | Red     | Unexpected error                         |

## Key concepts

| Concept | Description |
|---|---|
| **Single call** | Only one HTTP request is sent to the model |
| **Native tool** | Tool schema is passed directly in the API request (`tools` field) — no framework wrapping |
| **tool_choice: "required"** | Forces the model to use a tool instead of a plain text reply |
| **No execution** | The tool is never called — this example focuses on the model's decision, not the result |
