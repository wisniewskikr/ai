# Token Hygiene Demo

Demonstrates how to manage API tokens securely in AI agents using a **local Node.js proxy** — scoped virtual keys enforced server-side, short-lived TTL, and audit logging. Shows both the bad pattern (one key for everything) and the good pattern (separate virtual key per service).

## Requirements

- Node.js 22.5+ (uses built-in `node:sqlite`)
- OpenRouter API key

## Installation

```bash
npm install
cp .env.example .env
# fill in OPENROUTER_API_KEY and LITELLM_MASTER_KEY
```

## Usage

**Step 1** — start the local proxy (keep it running in a separate terminal):

```bash
npm run proxy
```

**Step 2** — generate scoped virtual keys for each service:

```bash
npm run setup-keys
```

Copy the printed keys into `.env`.

**Step 3** — run the demo:

```bash
npm run dev
```

## How it works

The local proxy sits between your services and OpenRouter. Services never see the real OpenRouter key — they receive scoped virtual keys issued by the proxy:

```
ChatAgent    → CHAT_API_KEY     ──┐
Analyzer     → ANALYZER_API_KEY ──┤──► Local Proxy ──► OpenRouter
Writer       → WRITER_API_KEY   ──┘        ↑
                                   OPENROUTER_API_KEY (here only)
```

Scope is enforced **server-side** — a virtual key for ChatAgent cannot call `claude-sonnet`, because the proxy rejects the request before it reaches OpenRouter. Every call is written to an audit log in SQLite.

## What it shows

| | Bad pattern | Good pattern |
|---|---|---|
| Tokens | One OpenRouter key for everything | Separate virtual key per service |
| Scope | Unrestricted | Allowed models only (server-side) |
| Expiry | Never | TTL in minutes |
| Logging | None | Audit log per call |

The demo runs four sections:
1. **BAD PATTERN** — same raw key, no scope, no expiry
2. **GOOD PATTERN** — scoped virtual keys via local proxy, TTL, real API calls
3. **SCOPE VIOLATION** — error when using an unauthorized model
4. **TOKEN EXPIRY** — error when token has expired

## Environment variables

| Variable | Used by |
|----------|---------|
| `OPENROUTER_API_KEY` | Local proxy only |
| `LITELLM_MASTER_KEY` | `npm run setup-keys` (admin) |
| `CHAT_API_KEY` | ChatAgent (scope: claude-haiku-4-5) |
| `ANALYZER_API_KEY` | Analyzer (scope: claude-haiku-4-5) |
| `WRITER_API_KEY` | Writer (scope: claude-sonnet-4-6) |

## File structure

```
proxy/
  server.ts        ← local proxy: key management, scope enforcement, audit log
src/
  prompts/         ← prompt builders (edit without touching logic)
  services/        ← business logic
    token-vault.ts ← in-process TTL, scope check, audit log
    chat-agent.ts
    analyzer.ts
    writer.ts
  utils/           ← shared helpers
    config.ts
    logger.ts
    openrouter.ts  ← calls local proxy
  index.ts         ← entry point / demo runner
  setup-keys.ts    ← creates virtual keys via proxy admin API
logs/              ← app.log written here at runtime
proxy.db           ← SQLite: virtual keys + audit log (git-ignored)
config.json        ← all configuration (models, TTL, proxy URL)
.env               ← API keys (never commit)
.env.example       ← template for .env
```

## Limitations

TokenVault still enforces TTL and scope in-process memory (client-side) as a second layer. The real security gain is that each service holds a **different** virtual key — if `CHAT_API_KEY` leaks, the attacker is limited to `claude-haiku-4-5` because the proxy enforces it at the network level.

TTL is not enforced server-side by the proxy (virtual keys in SQLite have no expiry by default). The `expiresAt` in TokenVault is client-side only.

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter (via local proxy)
- **Proxy**: Express + `node:sqlite` — no Python, no Docker, no external DB
- **Config**: `config.json` — all tuneable values in one place
