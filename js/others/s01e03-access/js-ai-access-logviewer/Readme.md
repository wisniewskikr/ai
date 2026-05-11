# js-ai-access-logviewer

Educational demo for **s01e03 — AI Agent Access Conditions**.

An AI agent (via OpenRouter) answers questions by calling read-only tools. Every action is written to a SQLite audit log with a timestamp. Use the viewer to see what the agent did, when, and with what result.

---

## Requirements

- Node.js 20+
- An [OpenRouter](https://openrouter.ai) API key
- Windows: `better-sqlite3` requires native build tools (`npm install --global windows-build-tools` or Visual Studio Build Tools)

---

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your API key:

```bash
cp .env.example .env
```

---

## Usage

```bash
# Start an agent session (interactive menu)
npm run agent

# Show the audit log
npm run viewer
```

---

## Project structure

```
src/
  index.ts              — entry point (agent or viewer mode)
  prompts/
    system.ts           — agent system prompt (editable)
  services/
    agent.ts            — OpenRouter agent loop with tool calling
    db.ts               — SQLite database initialization
    logger.ts           — audit log reads and writes
    viewer.ts           — terminal log viewer
  utils/
    tools.ts            — simulated read-only tools
logs/                   — daily log files (gitignored)
db/
  audit.db              — SQLite audit database (gitignored)
config.json             — model, paths, limits
.env                    — API key (never commit)
.env.example            — template
```

---

## Agent tools

All tools are read-only — the agent cannot write or delete anything.

| Tool | What it does | Scope |
|------|-------------|-------|
| `check_user_access(userId, resource)` | Checks user permissions | READ |
| `get_file_metadata(path)` | Returns file metadata (no contents) | READ |
| `list_recent_actions(limit)` | Reads the audit log | READ |

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | API key from openrouter.ai |
