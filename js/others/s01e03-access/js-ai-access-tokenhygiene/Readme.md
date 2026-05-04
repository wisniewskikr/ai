# Token Hygiene Demo

Demonstrates how to manage API tokens securely in AI agents using **LiteLLM proxy** — scoped virtual keys enforced server-side, short-lived TTL, and audit logging. Shows both the bad pattern (one key for everything) and the good pattern (separate virtual key per service).

## Requirements

- Node.js 18+
- Python 3.8+ (for LiteLLM proxy)
- OpenRouter API key

## Installation

```bash
npm install
pip install "litellm[proxy]"
```

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

## Usage

**Step 1** — start the LiteLLM proxy (keep it running in a separate terminal):

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

LiteLLM proxy sits between your services and OpenRouter. Services never see the real OpenRouter key — they receive scoped virtual keys issued by the proxy:

```
ChatAgent    → CHAT_API_KEY     ──┐
Analyzer     → ANALYZER_API_KEY ──┤──► LiteLLM Proxy ──► OpenRouter
Writer       → WRITER_API_KEY   ──┘         ↑
                                    OPENROUTER_API_KEY (here only)
```

Scope is enforced **server-side** — a virtual key for ChatAgent cannot call `claude-sonnet`, because the proxy rejects the request before it reaches OpenRouter.

## What it shows

| | Bad pattern | Good pattern |
|---|---|---|
| Tokens | One OpenRouter key for everything | Separate virtual key per service |
| Scope | Unrestricted | Allowed models only (server-side) |
| Expiry | Never | TTL in minutes |
| Logging | None | Audit log per call |

The demo runs four sections:
1. **BAD PATTERN** — same raw key, no scope, no expiry
2. **GOOD PATTERN** — scoped virtual keys via LiteLLM, TTL, real API calls
3. **SCOPE VIOLATION** — error when using an unauthorized model
4. **TOKEN EXPIRY** — error when token has expired

## Environment variables

| Variable | Used by |
|----------|---------|
| `OPENROUTER_API_KEY` | LiteLLM proxy only |
| `LITELLM_MASTER_KEY` | `npm run setup-keys` (admin) |
| `CHAT_API_KEY` | ChatAgent (scope: claude-haiku-4-5) |
| `ANALYZER_API_KEY` | Analyzer (scope: claude-haiku-4-5) |
| `WRITER_API_KEY` | Writer (scope: claude-sonnet-4-6) |

## File structure

```
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
    openrouter.ts  ← calls LiteLLM proxy
  index.ts         ← entry point / demo runner
  setup-keys.ts    ← creates virtual keys via LiteLLM admin API
litellm/
  config.yaml      ← LiteLLM proxy configuration
logs/              ← app.log written here at runtime
config.json        ← all configuration (models, TTL, proxy URL)
.env               ← API keys (never commit)
.env.example       ← template for .env
```

## Limitations

TokenVault still enforces TTL and scope only in-process memory (client-side). The real security gain is that each service holds a **different** virtual key — if `CHAT_API_KEY` leaks, the attacker is limited to `claude-haiku-4-5` because LiteLLM enforces it at the proxy level.

The remaining gap: TTL is not enforced server-side unless you set `duration` when generating keys via LiteLLM's admin API.

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter (via LiteLLM proxy)
- **Proxy**: LiteLLM — virtual keys with server-side scope enforcement
- **Config**: `config.json` — all tuneable values in one place
