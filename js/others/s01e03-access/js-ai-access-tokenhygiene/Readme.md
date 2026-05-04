# Token Hygiene Demo

Demonstrates good vs bad practices for managing API tokens in AI agents. Shows how scoped, short-lived tokens with audit logging reduce security risk compared to sharing a single unrestricted key.

## Requirements

- Node.js 18+
- OpenRouter API key

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and add your key:

```bash
cp .env.example .env
```

## Usage

```bash
npm run dev
```

## What it shows

| | Bad pattern | Good pattern |
|---|---|---|
| Tokens | One for everything | Separate per service |
| Scope | Unrestricted | Allowed models only |
| Expiry | Never | TTL in minutes |
| Logging | None | Audit log per call |

The demo runs four sections:
1. **BAD PATTERN** — same key, no scope, no expiry
2. **GOOD PATTERN** — scoped tokens, TTL, real API calls
3. **SCOPE VIOLATION** — error when using an unauthorized model
4. **TOKEN EXPIRY** — error when token has expired

## File structure

```
src/
  prompts/         ← prompt builders (edit without touching logic)
    chat.ts
    analyzer.ts
    writer.ts
  services/        ← business logic
    token-vault.ts
    chat-agent.ts
    analyzer.ts
    writer.ts
  utils/           ← shared helpers
    config.ts
    logger.ts
    openrouter.ts
  index.ts         ← entry point / demo runner
logs/              ← app.log written here at runtime
config.json        ← all configuration (models, TTL, limits)
.env               ← API key (never commit)
.env.example       ← template for .env
```

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter
- **Config**: `config.json` — all tuneable values in one place
