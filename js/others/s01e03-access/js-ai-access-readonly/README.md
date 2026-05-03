# Read-Only Agent Demo

A demonstration of **Level 1 — Read Only** AI agent security principles. The agent can only read data from a product catalog — it has no tools to create, update, or delete records.

## Key Concept: Principle of Least Privilege

The agent receives only 3 read-only tools (`list_products`, `search_products`, `get_product`). When asked to perform write operations, it explains that it lacks the capability — not because of a policy check, but because the tool simply does not exist.

## Requirements

- Node.js 18+
- OpenRouter API key

## Installation

```bash
npm install
cp .env.example .env  # fill in OPENROUTER_API_KEY
```

## Running

```bash
npm run dev
```

## File Structure

```
src/
  prompts/
    system.ts       — agent system prompt (editable without touching logic)
  agent.ts          — OpenRouter agent loop with read-only tools
  audit.ts          — timestamped audit trail writer
  db.ts             — SQLite database opened with readonly: true
  index.ts          — interactive menu + demo scenarios
  tools.ts          — tool definitions and handlers (SELECT only)
logs/
  audit.log         — auto-created on first run
config.json         — model, paths, agent settings
.env.example        — environment variable template
products.db         — SQLite database (auto-created and seeded on first run)
```

## Security Highlights

| Principle | Implementation |
|-----------|----------------|
| Least Privilege | Agent has only 3 READ tools, zero WRITE tools |
| Level 1 — Read Only | SQLite opened with `{ readonly: true }` |
| Audit Trail | Every tool call logged to `logs/audit.log` with timestamp |
| Token Hygiene | API key only in `.env`, never in source code |
