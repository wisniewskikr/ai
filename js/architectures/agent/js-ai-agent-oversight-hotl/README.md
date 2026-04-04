# js-ai-agent-oversight-hotl

A minimal „Hello World" demonstrating the **AI agent oversight architecture**
running in **human-on-the-loop (HOTL) mode** — the agent acts fully
autonomously while the human monitors progress in real-time and can interrupt
at any moment.

The agent's task: ask the model for N random names, then write
`Hello World, <name>!` to `workspace/output.txt` one line at a time,
with a configurable delay between each write.
Simple on purpose.  The point is the *pattern*, not the task.

---

## The Pattern

```
Orchestrator  ──(start)──►  Agent
     │                        │
     │              ┌─────────┴──────────┐
     │              │  autonomous loop   │
     │              │  write greeting 1  │──► file
     │              │  wait N seconds    │
     │              │  write greeting 2  │──► file
     │              │  wait N seconds    │
     │              │        ...         │
     │              └─────────┬──────────┘
     │                        │
     │◄────────(result)────────┘
     │
  [Human monitoring in real-time]
  [can press Enter at any time to interrupt]
```

**Human-on-the-loop** means the human is *outside* the action loop — they
observe what is happening and step in only when they decide to stop the run.
This is in contrast to **human-in-the-loop (HITL)** where the human must
approve every action before it executes.

| Mode | Human role          | Agent blocked? |
|------|---------------------|----------------|
| HITL | approve each action | yes — waits    |
| HOTL | monitor & interrupt | no — autonomous|

---

## How It Works

1. **Name generation** — the orchestrator starts the agent, which makes a
   single API call asking the model for N creative names.
2. **Autonomous writing** — the agent appends one greeting per loop iteration,
   waits `intervalSeconds`, then repeats.  No human approval is required.
3. **Live monitoring** — every write is logged to the console so the human can
   see exactly what is happening.
4. **Interrupt** — the human presses **Enter** at any time.  The orchestrator
   sets an `interrupted` flag; the agent checks it after every write and after
   every sleep tick (every 100 ms), so the response is nearly instant.
5. **Exit** — the application exits once the loop completes or the interrupt
   is acknowledged.

---

## Project Structure

```
main.js                    entry point; load config, start orchestrator
config.json                model, token limit, API base URL, greeting settings
.env                       API key (never commit this)
src/
  agents/
    orchestrator.js        HOTL supervisor; sets up interrupt listener
    agent.js               autonomous loop; generates names + writes greetings
  libs/
    api.js                 OpenRouter HTTP client
    config.js              load and validate config.json + .env
    logger.js              colorized console + daily log files
  prompts/
    agent.txt              system prompt for the model (name generator)
    orchestrator.txt       legacy task prompt (unused in HOTL)
  tools/
    tools.js               tool definitions (write_file — available for extension)
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
  "baseUrl": "https://openrouter.ai/api/v1",
  "greetingCount": 10,
  "intervalSeconds": 3
}
```

| Field             | Description                       | Default                        |
|-------------------|-----------------------------------|--------------------------------|
| `model`           | OpenRouter model ID               | `openai/gpt-4o-mini`           |
| `maxTokens`       | Maximum tokens per model response | `1024`                         |
| `baseUrl`         | OpenRouter API base URL           | `https://openrouter.ai/api/v1` |
| `greetingCount`   | Number of greetings to write      | `10`                           |
| `intervalSeconds` | Delay between greetings (seconds) | `3`                            |

---

## Run

```bash
npm start
```

### Scenario A — agent runs to completion

```
╔════════════════════════════════════════════════════════╗
║      AI Agent Oversight — Human-on-the-Loop Mode       ║
╚════════════════════════════════════════════════════════╝

[2026-04-04 12:00:00] [INFO  ] Model            : openai/gpt-4o-mini
[2026-04-04 12:00:00] [INFO  ] Max tokens       : 1024
[2026-04-04 12:00:00] [INFO  ] Greetings        : 10
[2026-04-04 12:00:00] [INFO  ] Interval         : 3s
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [STEP  ] [Orchestrator] Supervision mode: HUMAN-ON-THE-LOOP (HOTL)
[2026-04-04 12:00:00] [INFO  ] [Orchestrator] Agent will act fully autonomously
[2026-04-04 12:00:00] [INFO  ] [Orchestrator] You are monitoring — press Enter to interrupt at any time
────────────────────────────────────────────────────────
[2026-04-04 12:00:00] [INFO  ] [Agent] Asking model to generate 10 random names...
[2026-04-04 12:00:01] [INFO  ] [Agent] Names received: Zara, Theo, Mila, ...
────────────────────────────────────────────────────────
[2026-04-04 12:00:01] [STEP  ] [Agent] Entering autonomous greeting loop
[2026-04-04 12:00:01] [INFO  ] [Agent] Greetings to write : 10
[2026-04-04 12:00:01] [INFO  ] [Agent] Interval           : 3s
[2026-04-04 12:00:01] [INFO  ] [Oversight] Press Enter at any time to interrupt
────────────────────────────────────────────────────────
[2026-04-04 12:00:01] [TOOL  ] [Agent] Written (1/10): "Hello World, Zara!"
[2026-04-04 12:00:01] [INFO  ] [Oversight] File updated — 9 greeting(s) remaining
[2026-04-04 12:00:01] [INFO  ] [Agent] Next greeting in 3s  (Press Enter to interrupt)
[2026-04-04 12:00:04] [TOOL  ] [Agent] Written (2/10): "Hello World, Theo!"
...
[2026-04-04 12:00:28] [STEP  ] [Orchestrator] Agent completed task autonomously
[2026-04-04 12:00:28] [RESULT] Output file      : workspace/output.txt
[2026-04-04 12:00:28] [RESULT] Greetings written: 10
```

### Scenario B — human interrupts mid-run

```
[2026-04-04 12:00:10] [TOOL  ] [Agent] Written (3/10): "Hello World, Mila!"
[2026-04-04 12:00:10] [INFO  ] [Agent] Next greeting in 3s  (Press Enter to interrupt)

<Enter>

[2026-04-04 12:00:11] [INFO  ] [Oversight] Human requested interrupt — flagging agent
[2026-04-04 12:00:11] [INFO  ] [Oversight] Interrupt detected — agent stopping
────────────────────────────────────────────────────────
[2026-04-04 12:00:11] [STEP  ] [Orchestrator] Run interrupted by human
[2026-04-04 12:00:11] [RESULT] Greetings written before interrupt : 3
[2026-04-04 12:00:11] [RESULT] Output file                        : workspace/output.txt
[2026-04-04 12:00:11] [INFO  ] [Orchestrator] Partial output was saved to the file
```

The greetings written before the interrupt are preserved in the output file.

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

**Change greeting count or interval** — edit `config.json`:

```json
{
  "greetingCount": 5,
  "intervalSeconds": 1
}
```

**Add a new tool** — two steps:

1. Append a definition to `definitions` in `src/tools/tools.js`.
2. Add the matching execution branch in the `execute()` function.

**Switch back to HITL** — in `src/agents/agent.js`, add an `askHuman()`
call before each file write and cancel the loop on rejection.

---

## Requirements

- Node.js >= 18
- An [OpenRouter API key](https://openrouter.ai/keys)
