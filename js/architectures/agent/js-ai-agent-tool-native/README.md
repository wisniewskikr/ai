# js-ai-agent-tool-native

A minimal JavaScript agent that demonstrates the difference between letting a model do work itself versus delegating that work to a native tool.

The task is deliberately trivial — convert text to uppercase — so there is nothing to distract from the architecture. The same input goes through two independent phases, and both should produce the same result.

## What it does

Given an input string (default: `"hello world"`), the agent runs two phases:

**Phase 1 — without tools**
The model receives the text and a clear instruction. It converts the text to uppercase using its own language understanding. No tools involved.

**Phase 2 — with tools**
The model is given the `to_uppercase` tool schema. It decides to call the tool, passes the text as an argument, and we execute the actual JavaScript function locally. The result is sent back to the model, which formulates the final response.

Expected output from both phases: `HELLO WORLD`

## Requirements

- Node.js 18 or later
- An [OpenRouter](https://openrouter.ai) API key

## Setup

**1. Install dependencies**

```sh
npm install
```

**2. Set your API key**

The `.env` file is already in place — add your key:

```
OPENROUTER_API_KEY=your_key_here
```

**3. Review configuration**

`config.json` controls the model, token limit, and default input:

```json
{
  "model": "gpt-4o",
  "maxTokens": 1024,
  "temperature": 0,
  "input": "hello world"
}
```

## Usage

Run with the default input from `config.json`:

```sh
npm start
```

Run with a custom input:

```sh
node index.js "your text here"
```

## Output

Every run produces colored output on the console and appends a plain-text log to `logs/YYYY-MM-DD.log`. The `logs/` directory is created automatically on first run and is gitignored.

Console log levels:

| Tag      | Meaning                                                  |
|----------|----------------------------------------------------------|
| `[STEP]` | A phase or milestone in the agent's execution            |
| `[INFO]` | What the agent is about to do and with what parameters   |
| `[TOOL]` | A native tool was called; shows arguments and output     |
| `[RESULT]`| The value produced at the end of a phase               |
| `[ERROR]`| Something went wrong                                     |

## Project structure

```
├── index.js          Entry point — reads config, starts the agent
├── config.json       Model, token limit, and default input
├── .env              API key (never commit this)
└── src/
    ├── agent.js      Orchestrates both phases; contains the tool-use loop
    ├── tools.js      Tool schema for the model + the JS handlers that run them
    └── logger.js     Writes to console (colored) and to logs/ (plain text)
```

## How native tools work

When the model calls a tool, this is what happens:

1. We send the request with a list of tool schemas (JSON Schema format).
2. The model responds with a `tool_calls` array instead of plain text.
3. We parse the tool name and arguments from that array.
4. We run the corresponding JavaScript function locally (`executeTool`).
5. We send the function's return value back as a `tool` role message.
6. The model reads the result and writes its final response.

The model never executes code. It only decides what to call and with what arguments. The actual execution always happens in our process, which means we control what the tools can do.

## Changing the model

Any model available on OpenRouter that supports function calling will work. Update the `model` field in `config.json`:

```json
{ "model": "anthropic/claude-opus-4-6" }
```

## Adding a new tool

1. Add the tool's JSON Schema to the `TOOLS` array in `src/tools.js`.
2. Add the corresponding handler function to `TOOL_HANDLERS` in the same file.

The name must match exactly in both places. That's it.
