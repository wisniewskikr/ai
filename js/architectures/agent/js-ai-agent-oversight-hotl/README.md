# js-ai-agent-oversight-hitl

A minimal "Hello World" demonstrating the **AI agent oversight architecture**
running in **human-in-the-loop (HITL) mode** — the agent proposes an action,
and a human must approve it before it is executed.

The agent's task: write `Hello World, <name>!` to `workspace/output.txt`,
where the name is chosen freely by the model on each run.
Simple on purpose.  The point is the *pattern*, not the task.

---

## The Pattern

```
Orchestrator  ──(task)──►  Agent  ──(tool call)──►  [Oversight checkpoint]
     │                       │                               │
     │                       │                        ask human (y/n)
     │                       │                          │         │
     │                       │                        yes         no
     │                       │                          │         │
     │◄───────(result)────────┘◄──(result)──────────────┘    cancel task
```

**Orchestrator** (`src/agents/orchestrator.js`) — the supervisor:
- Loads the task prompt and ensures the workspace exists.
- Monitors every tool call the agent makes.
- Reports the final outcome, or logs cancellation if the human rejected.

**Agent** (`src/agents/agent.js`) — the autonomous worker:
- Receives the task from the orchestrator.
- Runs an agentic loop until the task is complete or cancelled:
  1. Call the model.
  2. If the model requests a tool → pause at the oversight checkpoint,
     ask the human for approval, then execute (or cancel) and feed result back.
  3. If the model returns `stop` → done.

**Tools** (`src/tools/tools.js`) — capabilities the agent can use:
- `write_file` — write text to a file.

---

## Project Structure

```
main.js                    entry point; load config, start orchestrator
config.json                model, token limit, API base URL
.env                       API key (never commit this)
src/
  agents/
    orchestrator.js        supervisor; loads task, manages run lifecycle
    agent.js               agentic loop with HITL oversight checkpoint
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

### Scenario A — human approves

```
╔════════════════════════════════════════════════════════╗
║      AI Agent Oversight — Human-in-the-Loop Mode       ║
╚════════════════════════════════════════════════════════╝

[2026-04-04 12:00:00] [INFO  ] Model    : openai/gpt-4o-mini
[2026-04-04 12:00:00] [INFO  ] Max tokens: 1024
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Orchestrator] Assigning task to agent
[2026-04-04 12:00:00] [INFO  ] [Orchestrator] Supervision mode: human-in-the-loop
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Agent] Entering agentic loop
[2026-04-04 12:00:00] [INFO  ] [Agent] Sending request to model...
[2026-04-04 12:00:01] [INFO  ] [Agent] Stop reason: tool_calls
[2026-04-04 12:00:01] [TOOL  ] [Agent] Tool call : write_file
[2026-04-04 12:00:01] [TOOL  ] [Agent] Arguments : {"path":"workspace/output.txt","content":"Hello World, Zephyr!"}
[2026-04-04 12:00:01] [INFO  ] [Oversight] HUMAN-IN-THE-LOOP — awaiting human approval
[2026-04-04 12:00:01] [INFO  ] [Oversight] Agent wants to write to file:
[2026-04-04 12:00:01] [INFO  ]   Path   : workspace/output.txt
[2026-04-04 12:00:01] [INFO  ]   Content: "Hello World, Zephyr!"

[Oversight] Approve this action? (y/n): y

[2026-04-04 12:00:03] [INFO  ] [Oversight] Human APPROVED the action — executing
[2026-04-04 12:00:03] [TOOL  ] [Agent] Result    : OK — wrote 21 chars to "workspace/output.txt"
[2026-04-04 12:00:04] [INFO  ] [Agent] Stop reason: stop
[2026-04-04 12:00:04] [STEP  ] [Orchestrator] Agent completed task
[2026-04-04 12:00:04] [RESULT] File content : "Hello World, Zephyr!"
```

### Scenario B — human rejects

```
[Oversight] Approve this action? (y/n): n

[2026-04-04 12:00:03] [INFO  ] [Oversight] Human REJECTED the action — task cancelled
────────────────────────────────────────────────────────
[2026-04-04 12:00:03] [STEP  ] [Orchestrator] Task cancelled by human
[2026-04-04 12:00:03] [INFO  ] [Orchestrator] No file was written
```

The name changes on every run — the model picks it freely.

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
| `WARN`   | Non-fatal oddities                           |
| `ERROR`  | Fatal problems                               |

---

## Extending This Demo

**Add a new tool** — two steps:

1. Append a definition to `definitions` in `src/tools/tools.js`.
2. Add the matching execution branch in the `execute()` function.

The agent discovers available tools automatically on each run.

**Customize the approval prompt** — in `src/agents/agent.js`, find the
oversight checkpoint and adjust the `askHuman()` call or the display logic
for any tool type.

---

## Requirements

- Node.js >= 18
- An [OpenRouter API key](https://openrouter.ai/keys)
