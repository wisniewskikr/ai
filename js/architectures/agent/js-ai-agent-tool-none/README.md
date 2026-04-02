# js-ai-agent-tool-none

A minimal "Hello World" agent that converts a prompt to uppercase using an LLM.

No tools. No streaming. No over-engineering. Just an agent call that does one thing.

---

## What it does

1. Reads `config.json` for the default prompt and model.
2. Sends the prompt to the model with a strict system instruction to uppercase it.
3. Logs every step to the console and to a daily log file under `logs/`.
4. Prints the result.

Given the prompt `"hello world"`, the expected output is `HELLO WORLD`.

---

## Requirements

- Node.js 18 or later
- An [OpenRouter](https://openrouter.ai) API key

---

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your key:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Configuration

`config.json` controls the default prompt and model:

```json
{
  "prompt": "hello world",
  "model": "openai/gpt-4o"
}
```

Any model available on OpenRouter works here.

---

## Usage

Run with the default prompt from `config.json`:

```bash
npm start
```

Override the prompt via a CLI argument:

```bash
node index.js "good morning"
```

---

## Output

Console output is colour-coded by log level. Log files are written daily to `logs/YYYY-MM-DD.log` in plain text (no ANSI codes) so they are safe to grep.

Example run:

```
[2026-04-02T10:00:00.000Z] [INFO  ] === Agent started ===
[2026-04-02T10:00:00.001Z] [INFO  ] Model  : openai/gpt-4o
[2026-04-02T10:00:00.002Z] [INFO  ] Prompt : "hello world"
[2026-04-02T10:00:00.003Z] [STEP  ] Sending prompt to model...
[2026-04-02T10:00:01.234Z] [STEP  ] Response received
[2026-04-02T10:00:01.235Z] [INFO  ] Tokens : 42 (prompt=28, completion=14)
[2026-04-02T10:00:01.236Z] [RESULT] Output : HELLO WORLD
[2026-04-02T10:00:01.237Z] [INFO  ] === Agent finished ===
```

---

## Project structure

```
.
├── .env            # API key (not committed)
├── config.json     # Default prompt and model
├── index.js        # Entry point — wires config, env, agent, logger
├── agent.js        # Agent logic — one call, one response, no tools
├── logger.js       # Two-target logger (console + daily log file)
├── package.json
└── logs/           # Created automatically, gitignored
```

---

## Architecture notes

This project follows the **agent pattern without tools**:

- The agent receives a prompt via `messages[]`.
- The model responds in a single turn.
- There is no tool-calling loop because there are no tools.

If you want to add tools later, the loop goes in `agent.js`: check
`finish_reason === 'tool_calls'`, execute, append results, repeat.

---

## License

MIT
