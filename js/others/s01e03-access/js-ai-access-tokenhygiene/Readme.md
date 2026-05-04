# Token Hygiene Demo

Demonstrates the architectural pattern for managing API tokens in AI agents — scoped, short-lived tokens with audit logging. Shows how the pattern should work, and where this implementation falls short of true security.

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

## Limitations

> This project demonstrates an architectural pattern, not a real security boundary.

All three tokens in `TokenVault` are aliases of the same `OPENROUTER_API_KEY`. Every protection is enforced client-side, in process memory only:

| Mechanism | Enforced by | If the key is stolen |
|-----------|-------------|----------------------|
| Scope (model) | application code | attacker calls any model via curl |
| TTL | current process session | resets on every restart |
| Audit log | local file | attacker leaves no trace |

OpenRouter has no knowledge of our scope rules — the key grants full account access regardless.

### What this project actually provides

- **Audit log** — you know what was called and when
- **Protection against coding mistakes** — a service cannot accidentally call an unauthorized model
- **Separation of concerns** — services operate on named tokens, not raw keys

### When the pattern provides real security

Each service needs a **truly separate key with server-side restrictions**:

```
CHAT_TOKEN     → key restricted to claude-haiku, expires in 5min server-side
ANALYZER_TOKEN → different key, different permissions
WRITER_TOKEN   → another separate key
```

This is how **HashiCorp Vault**, **AWS Secrets Manager**, and **GCP Secret Manager** work — the vault issues short-lived, scoped credentials enforced at the server. Until OpenRouter supports per-model scoped tokens, this project illustrates the pattern without fully delivering its security guarantees.

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter
- **Config**: `config.json` — all tuneable values in one place
