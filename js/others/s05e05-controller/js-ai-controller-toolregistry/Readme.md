# Tool Registry Hello World

Think of a toolbox with labels on every drawer.
The AI doesn't guess — it reads the label and picks the right tool.
That's a **Tool Registry**.

## What this project shows

| Concept | What you see |
|---------|-------------|
| **Tool Registry** | A catalog of tools with description, cost, and daily limits |
| **Two-phase routing** | Router filters tools by tags before the agent sees them |
| **Multi-turn loop** | Proper tool use: send → execute → return result → get final answer |
| **CLI menu** | Choose a preset scenario or type your own question |

## Tool Registry vs plain tools

**Plain tools** — you dump everything on the table and say "pick one":
- Works fine for 3–5 tools
- Falls apart at 20+ tools (model gets confused, costs spike)

**Tool Registry** — a labeled toolbox with extra metadata:

| Field | Example | Why |
|-------|---------|-----|
| `cost` | `"low"` / `"medium"` | Skip expensive tools when not needed |
| `limitPerDay` | `100` | Stop before hitting API rate limits |
| `tags` | `["math", "local"]` | Filter tools by request context |
| `fallback` | `"translate_text"` | Know what to use when a tool fails |

> Rule of thumb: plain tools for demos, registry for production.

## Requirements

- Node.js 20+
- OpenRouter API key

## Installation

```bash
npm install
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

## Run

```bash
npm run dev
```

## Menu

```
=== Tool Registry Demo ===

Pick an option:
  1. Check weather for a city
  2. Translate text to English
  3. Solve a math problem
  4. Summarize a text
  5. Type your own question
  0. Exit
```

Options 1–4 are preset scenarios with ready-made input.
Option 5 lets the agent choose the right tool on its own.

## How the agent loop works

```
User sends a question
        |
        v
Phase 1 — Router: query + all tags → model returns matching tags
        |
        v
Registry filtered to tools with matching tags
        |
        v
Phase 2 — Agent: question + filtered tools sent to OpenRouter
        |
        v
Model returns: finish_reason = "tool_calls"
        |
        v
App executes the tool locally
        |
        v
Tool result sent back to model
        |
        v
Model returns: finish_reason = "stop" → final answer shown
```

The router reduces the tool list before the agent sees it.
For 4 tools it changes nothing. For 50+ tools it prevents context bloat and wrong tool selection.

## File structure

```
src/
  prompts/
    agent.md          — system prompt for the main agent
    router.md         — system prompt for the tag router
  services/
    registry.ts       — tool catalog with cost, limits, and tags
    agent.ts          — two-phase routing + multi-turn tool use loop
    weather.ts        — weather tool (mock data)
    translator.ts     — translation tool (LLM-powered)
    calculator.ts     — math evaluation (mathjs, no eval())
    summarizer.ts     — text summarization (LLM-powered)
  utils/
    logger.ts         — file logger + daily usage tracking
    llm.ts            — simple LLM call helper (no tools)
  index.ts            — CLI entry point
config.json           — model, limits, timeouts
logs/
  app.log             — human-readable event log
  usage.json          — daily tool usage counters (persisted)
```

## Log format

```
[2026-06-11 14:23:01] [INFO ] User selected option: 2
[2026-06-11 14:23:02] [INFO ] Agent selected tool: translate_text
[2026-06-11 14:23:03] [INFO ] Tool executed successfully — time: 1.2s
[2026-06-11 14:23:10] [WARN ] Approaching daily limit: translate_text (180/200)
[2026-06-11 14:23:15] [ERROR] Daily limit exceeded: summarize (50/50) — request rejected
```
