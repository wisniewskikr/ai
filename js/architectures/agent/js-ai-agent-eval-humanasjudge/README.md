# js-ai-agent-eval-humanasjudge

A minimal "Hello World" demonstrating the **AI agent architecture**
with **human-as-judge evaluation**.

The agent's task: write `Hello World, <name>!` to `workspace/output.txt`,
where the name is chosen freely by the model on each run.
After the agent finishes, a human evaluator reads the output and decides
whether it meets their expectations.  If yes — the file stays.  If no — the file is deleted.
Simple on purpose.  The point is the *pattern*, not the task.

---

## The Pattern

```
Orchestrator  ──(task)──►  Agent  ──(tool call)──►  write_file
     │                       │                           │
     │◄───────(result)────────┘◄──────(result)───────────┘
     │
     ▼
  Evaluator  ──(show output)──►  Human  ──►  PASS (file stays)
                                          └──►  FAIL (file deleted)
```

**Orchestrator** (`src/agents/orchestrator.js`) — the supervisor:
- Loads the task prompt and ensures the workspace exists.
- Triggers the evaluator after the agent finishes.

**Agent** (`src/agents/agent.js`) — the autonomous worker:
- Receives the task from the orchestrator.
- Runs an agentic loop until the task is complete:
  1. Call the model.
  2. If the model requests a tool → execute it, feed result back, repeat.
  3. If the model returns `stop` → done.

**Tools** (`src/tools/tools.js`) — capabilities the agent can use:
- `write_file` — write text to a file.

**Evaluator** (`src/eval/evaluator.js`) — human-as-judge evaluation:
- Step 0: output file exists and is readable.
- Step 1: display the file content to the human evaluator.
- Step 2: ask — does this meet your expectations? (`yes` / `no`)
- Step 3: `yes` → file stays, evaluation passes. `no` → file deleted, evaluation fails.

---

## Project Structure

```
main.js                    entry point; load config, start orchestrator
config.json                model, token limit, API base URL
.env                       API key (never commit this)
src/
  agents/
    orchestrator.js        supervisor; loads task, manages run lifecycle
    agent.js               agentic loop
  eval/
    evaluator.js           human-as-judge evaluation of the agent's output
  libs/
    api.js                 OpenRouter HTTP client
    config.js              load and validate config.json + .env
    logger.js              colorized console + daily log files
  prompts/
    agent.txt              system prompt for the model (agent.js)
    orchestrator.txt       task prompt handed to the agent (orchestrator.js)
  tools/
    tools.js               tool definitions and execution
workspace/                 output files (git-ignored)
logs/                      daily log files (git-ignored)
```

---

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Set your API key**

Edit `.env`:

```
OPENROUTER_API_KEY=sk-or-...
```

Get a key at [openrouter.ai/keys](https://openrouter.ai/keys).

**3. (Optional) Edit config.json**

```json
{
  "model": "openai/gpt-4o-mini",
  "maxTokens": 1024,
  "baseUrl": "https://openrouter.ai/api/v1"
}
```

| Field       | Description                       | Default                          |
|-------------|-----------------------------------|----------------------------------|
| `model`     | OpenRouter model ID               | `openai/gpt-4o-mini`             |
| `maxTokens` | Maximum tokens per model response | `1024`                           |
| `baseUrl`   | OpenRouter API base URL           | `https://openrouter.ai/api/v1`   |

---

## Run

```bash
npm start
```

Expected console output:

```
╔════════════════════════════════════════════════════════╗
║          AI Agent — Human-as-Judge Evaluation          ║
╚════════════════════════════════════════════════════════╝

[2026-04-04 12:00:00] [INFO  ] Model    : openai/gpt-4o-mini
[2026-04-04 12:00:00] [INFO  ] Max tokens: 1024
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Orchestrator] Assigning task to agent
[2026-04-04 12:00:00] [INFO  ] [Orchestrator] Eval mode: human-as-judge
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Agent] Entering agentic loop
[2026-04-04 12:00:00] [INFO  ] [Agent] Sending request to model...
[2026-04-04 12:00:01] [INFO  ] [Agent] Stop reason: tool_calls
[2026-04-04 12:00:01] [TOOL  ] [Agent] Tool call : write_file
[2026-04-04 12:00:01] [TOOL  ] [Agent] Arguments : {"path":"workspace/output.txt","content":"Hello World, Aurora!"}
[2026-04-04 12:00:01] [INFO  ] [Agent] Executing tool call
[2026-04-04 12:00:01] [TOOL  ] [Agent] Result    : OK — wrote 20 chars to "workspace/output.txt"
[2026-04-04 12:00:02] [INFO  ] [Agent] Stop reason: stop
────────────────────────────────────────────────────────
[2026-04-04 12:00:02] [STEP  ] [Orchestrator] Agent completed task
[2026-04-04 12:00:02] [RESULT] File content : "Hello World, Aurora!"
────────────────────────────────────────────────────────
[2026-04-04 12:00:02] [STEP  ] [Evaluator] Human-as-judge evaluation
[2026-04-04 12:00:02] [PASS  ] Output file exists (workspace/output.txt)
────────────────────────────────────────────────────────
[2026-04-04 12:00:02] [RESULT] File content : "Hello World, Aurora!"
────────────────────────────────────────────────────────
Does this meet your expectations? [yes/no]: yes
[2026-04-04 12:00:05] [PASS  ] Human approved — file kept

╔════════════════════════════════════════════════════════╗
║              ALL TESTS PASSED  (1/1)                  ║
╚════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────
[2026-04-04 12:00:05] [INFO  ] [Orchestrator] Run finished — eval PASSED
```

The name changes on every run — the model picks it freely.

If the human answers `no`, the output is deleted and the run ends with `eval FAILED`.

---

## Logging

Every run appends to `logs/YYYY-MM-DD.log`.  The log file uses plain ASCII
(no ANSI codes) so it is readable with any tool.

Log levels:

| Level    | Meaning                                      |
|----------|----------------------------------------------|
| `INFO`   | General status messages                      |
| `STEP`   | Major phase transitions                      |
| `TOOL`   | Tool call / result details                   |
| `RESULT` | Final output values                          |
| `PASS`   | Evaluation passed                            |
| `FAIL`   | Evaluation failed                            |
| `WARN`   | Non-fatal oddities                           |
| `ERROR`  | Fatal problems                               |

---

## Extending This Demo

**Add a new tool** — two steps:

1. Append a definition to `definitions` in `src/tools/tools.js`.
2. Add the matching execution branch in the `execute()` function.

The agent discovers available tools automatically on each run.

**Switch evaluation to automated tests** — replace the body of `runEval()` in
`src/eval/evaluator.js` with assertions on `content` and remove the `readline` prompt.

---

## Requirements

- Node.js >= 18
- An [OpenRouter API key](https://openrouter.ai/keys)
