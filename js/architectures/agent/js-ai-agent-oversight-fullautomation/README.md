# js-ai-agent-oversight-fullautomation

A minimal "Hello World" demonstrating the **AI agent oversight architecture**
running in **full-automation mode** — the agent acts without human approval.

The agent's only task: write `Hello World, Ada!` to `workspace/output.txt`.
Simple on purpose.  The point is the *pattern*, not the task.

---

## The Pattern

```
Orchestrator  ──(task)──►  Agent  ──(tool call)──►  write_file
     │                       │                           │
     │◄───────(result)────────┘◄──────(result)───────────┘
     │
  [Oversight checkpoint]
  Full-automation: auto-approve
  Supervised mode: wait for human
```

**Orchestrator** (`main.js`) — the supervisor:
- Defines the task.
- Monitors every tool call the agent makes.
- In *full-automation* mode: approves all calls automatically.
- In *supervised* mode (not implemented here): pauses and asks a human.

**Agent** (`src/agents/agent.js`) — the autonomous worker:
- Receives the task from the orchestrator.
- Runs an agentic loop until the task is complete:
  1. Call the model.
  2. If the model requests a tool → execute it, feed result back, repeat.
  3. If the model says `end_turn` → done.

**Tools** (`src/tools/tools.js`) — capabilities the agent can use:
- `write_file` — write text to a file.

---

## Project Structure

```
main.js                    entry point; orchestrator logic
config.json                model name, token limit, output name
.env                       API key (never commit this)
src/
  agents/
    agent.js               agentic loop
  libs/
    config.js              load and validate config.json + .env
    logger.js              colorized console + daily log files
  prompts/
    agent.txt              system prompt for the model
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
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

**3. (Optional) Edit config.json**

```json
{
  "model": "claude-haiku-4-5-20251001",
  "maxTokens": 1024,
  "name": "Ada"
}
```

| Field       | Description                        | Default                     |
|-------------|------------------------------------|-----------------------------|
| `model`     | Anthropic model ID                 | `claude-haiku-4-5-20251001` |
| `maxTokens` | Maximum tokens per model response  | `1024`                      |
| `name`      | Name inserted into the output text | `Ada`                       |

---

## Run

```bash
npm start
```

Expected console output:

```
╔════════════════════════════════════════════════════════╗
║         AI Agent Oversight — Full Automation Mode      ║
╚════════════════════════════════════════════════════════╝

[2026-04-04 12:00:00] [INFO  ] Model    : claude-haiku-4-5-20251001
[2026-04-04 12:00:00] [INFO  ] Name     : Ada
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Orchestrator] Assigning task to agent
[2026-04-04 12:00:00] [INFO  ] [Orchestrator] Supervision mode: full-automation
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Agent] Entering agentic loop
[2026-04-04 12:00:00] [INFO  ] [Agent] Sending request to model...
[2026-04-04 12:00:01] [INFO  ] [Agent] Stop reason: tool_use
[2026-04-04 12:00:01] [TOOL  ] [Agent] Tool call : write_file
[2026-04-04 12:00:01] [TOOL  ] [Agent] Arguments : {"path":"workspace/output.txt","content":"Hello World, Ada!"}
[2026-04-04 12:00:01] [INFO  ] [Oversight] Full-automation — tool call auto-approved
[2026-04-04 12:00:01] [TOOL  ] [Agent] Result    : OK — wrote 17 chars to "workspace/output.txt"
[2026-04-04 12:00:01] [STEP  ] [Orchestrator] Agent completed task
[2026-04-04 12:00:01] [RESULT] File content : "Hello World, Ada!"
```

Output file:

```bash
cat workspace/output.txt
# Hello World, Ada!
```

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

**Switch to supervised mode** — in `src/agents/agent.js`, find the oversight
checkpoint comment and add a `readline` prompt before calling `execute()`.
The rest of the loop stays unchanged.

---

## Requirements

- Node.js >= 18
- An [Anthropic API key](https://console.anthropic.com/)
