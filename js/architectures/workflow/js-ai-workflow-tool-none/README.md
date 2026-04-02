# js-ai-workflow-tool-none

A **Hello World** example of an AI **Workflow** architecture in JavaScript — no external tools, no branching agents.

The workflow takes a text prompt and converts it to uppercase in two distinct ways:
1. **Programmatically** — plain JavaScript `String.prototype.toUpperCase()`
2. **Via AI model** — a call to an LLM through OpenRouter

Every step is logged both to the **console** (with colour) and to a timestamped file inside the `logs/` directory.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                      WORKFLOW                       │
│                                                     │
│  Node 1          Node 2          Node 3             │
│  loadConfig  →  validateInput →  programmatic  ─┐   │
│                                                  │   │
│  Node 5          Node 4                          │   │
│  outputResults ← aiTransform  ←──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

Each node is a self-contained `async` function that receives the accumulated state object and returns an enriched version of it. There are no tools, no function-calling, and no agent loops — just a linear chain of steps.

---

## Project structure

```
js-ai-workflow-tool-none/
├── index.js        # workflow runner + all five nodes
├── logger.js       # console + file logger
├── config.json     # prompt and model settings
├── .env            # OPENROUTER_API_KEY (not committed)
├── package.json
├── logs/           # generated at runtime (git-ignored)
└── README.md
```

---

## Configuration

### `config.json`

| Key      | Description                                    | Default              |
|----------|------------------------------------------------|----------------------|
| `prompt` | The text to be uppercased                      | `"hello world"`      |
| `model`  | OpenRouter model identifier                    | `"openai/gpt-4o"`    |

### `.env`

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `OPENROUTER_API_KEY`  | Your OpenRouter API key            |

---

## Prerequisites

- **Node.js** ≥ 18 (native `fetch` not required — uses the `openai` package)
- An **OpenRouter** account and API key → [openrouter.ai](https://openrouter.ai)

---

## Installation

```bash
npm install
```

---

## Usage

```bash
npm start
```

### Expected console output

```
[...] [STEP   ] Workflow START — Hello World (uppercase transformation)
[...] [STEP   ] Node 1 › Loading configuration
[...] [INFO   ]   config.json  →  prompt : "hello world"
[...] [INFO   ]   config.json  →  model  : openai/gpt-4o
[...] [STEP   ] Node 2 › Validating input
[...] [SUCCESS]   All inputs are valid.
[...] [STEP   ] Node 3 › Converting to uppercase programmatically
[...] [SUCCESS]   Output : "HELLO WORLD"
[...] [STEP   ] Node 4 › Converting to uppercase using AI model
[...] [SUCCESS]   Output : "HELLO WORLD"
[...] [STEP   ] Node 5 › Final results
[...] [SUCCESS]   Programmatic result  : "HELLO WORLD"
[...] [SUCCESS]   AI model result      : "HELLO WORLD"
[...] [STEP   ] Workflow END — completed successfully
```

---

## Logs

Each run creates a timestamped log file in `logs/`:

```
logs/workflow-2026-04-02T10-30-00.log
```

The `logs/` directory is git-ignored.

---

## Key design decisions

| Decision | Reason |
|---|---|
| Linear workflow (no tools) | Demonstrates the simplest AI architecture: a fixed sequence of nodes with no dynamic routing |
| Two-stage uppercase | Shows the contrast between deterministic code and non-deterministic LLM calls for the same task |
| `temperature: 0` | Makes the AI call reproducible and focused on the single task |
| State passed as plain objects | Keeps each node pure and easy to test in isolation |
