# Memory Triad Demo

A CLI assistant that remembers — like a person does.

| Memory layer | Analogy | Lives in |
|---|---|---|
| Short-term | Notepad on your desk | RAM |
| Long-term | Filing cabinet | SQLite |
| Episodic | Personal diary | SQLite |

Most AI agents only have the first layer. This demo shows all three.

---

## Requirements

- Node.js 20+
- OpenRouter API key ([openrouter.ai](https://openrouter.ai))

---

## Installation

```bash
npm install
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

---

## Usage

```bash
npm run dev
```

Menu:

```
What would you like to do?
  1. Introduce me       — agent tells who you are (long-term)
  2. Remember my name   — saves your name to the database (long-term)
  3. Summarize session  — summary of this conversation (short-term)
  4. Show action log    — what the agent did before (episodic)
  5. Ask your question  — custom question with full memory context
  6. Clear my data      — remove all long-term and episodic memory
  7. Exit
```

---

## Project structure

```
project/
├── src/
│   ├── prompts/
│   │   ├── system.md              — main agent system prompt
│   │   ├── summarize.md           — prompt for session summary
│   │   ├── introduce.md           — prompt for user introduction
│   │   └── context-builder.ts     — assembles context from all three memory layers
│   ├── memory/
│   │   ├── MemoryManager.ts       — facade: access to all three layers
│   │   ├── shortTerm.ts           — current session messages (with auto-trim)
│   │   ├── longTerm.ts            — key-value store on SQLite
│   │   └── episodic.ts            — action log with recent-N summary
│   ├── services/
│   │   ├── openrouter.ts          — calls the model via OpenRouter
│   │   └── database.ts            — SQLite initialization
│   └── cli/
│       ├── handlers.ts            — logic for each menu option
│       └── logger.ts              — writes logs to logs/
├── logs/                          — app logs (auto-created)
├── db/
│   └── memory.db                  — SQLite database (auto-created)
├── index.ts                       — entry point, CLI loop
├── config.json                    — model, limits, paths
├── .env                           — OPENROUTER_API_KEY
└── .env.example                   — env template
```

---

## Configuration

`config.json` — all runtime settings:

| Key | Default | Description |
|-----|---------|-------------|
| `model` | `anthropic/claude-haiku-4-5` | OpenRouter model |
| `maxTokens` | `1024` | Max tokens per response |
| `maxShortTermMessages` | `20` | Session history limit (oldest trimmed first) |
| `maxEpisodicSummaryEntries` | `5` | How many past actions are injected into context |
| `dbPath` | `./db/memory.db` | SQLite database path |
| `logsDir` | `./logs` | Log output directory |
