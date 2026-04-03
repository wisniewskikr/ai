# js-ai-agent-memory-incache

A minimal "Hello World" demonstrating **prompt caching (in-cache memory)** with the Anthropic API.

The agent loads a large fictional profile document (~1 100 words) as the system prompt
and marks it with `cache_control: { type: "ephemeral" }`.  The same question is asked
twice in a row so the difference between a cache miss and a cache hit is clearly visible
in the token-usage stats.

---

## What it does

```
Call 1 — CACHE MISS
  cache_creation_input_tokens : 1 6xx   ← document processed and written to cache
  cache_read_input_tokens     : 0
  Answer: Hello World, Chris

Call 2 — CACHE HIT
  cache_creation_input_tokens : 0
  cache_read_input_tokens     : 1 6xx   ← document read from cache (faster & cheaper)
  Answer: Hello World, Chris
```

The name **Chris** is extracted from `src/prompts/chris_profile.txt` — a fictional
profile document that also serves as the large cached payload.

---

## Architecture

```
main.js                        - entry point; runs call 1 (miss) then call 2 (hit)
src/
  agents/agent.js              - builds the system prompt with cache version suffix
  lib/api.js                   - Anthropic SDK wrapper with cache_control
  lib/config.js                - loads config.json + .env
  lib/logger.js                - console + file logging
  prompts/chris_profile.txt    - ~1 100-word fictional profile (the cached document)
cache_state.json               - auto-created; stores cache version for --clear-cache
logs/                          - daily log files (YYYY-MM-DD.log)
config.json                    - model, maxTokens, temperature
.env                           - ANTHROPIC_API_KEY (never commit this)
```

---

## How prompt caching works

```
First call                         Second call (within ~5 min)
──────────────────────────────     ──────────────────────────────
[system]  chris_profile.txt        [system]  chris_profile.txt
          cache_control ──►  ✔ written to cache   ◄── read from cache
[user]    "Hello World + name?"    [user]    "Hello World + name?"

usage.cache_creation_input_tokens > 0    usage.cache_read_input_tokens > 0
```

Anthropic caches the system prompt server-side.  On the first call the full document
is processed (cache miss) and written to the cache.  On every subsequent call within
the TTL (~5 minutes) the cached version is reused — the document is not re-processed,
which reduces latency and cost.

Clearing the cache increments a version counter appended to the document, which changes
the cache key and forces a miss on the next call.

---

## Dependencies

| Package              | Purpose                              |
|----------------------|--------------------------------------|
| `@anthropic-ai/sdk`  | Anthropic API client with caching    |
| `dotenv`             | Load `ANTHROPIC_API_KEY` from `.env` |

---

## Setup

```bash
npm install
```

Create `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

> **Why Anthropic directly and not OpenRouter?**
> OpenRouter's non-BYOK mode uses its own Anthropic account and does not forward
> prompt-cache stats (`cache_creation_input_tokens` / `cache_read_input_tokens`) back
> to the caller — both fields are always `0`.  The Anthropic SDK is required to observe
> real caching behaviour.

---

## Usage

```bash
# Run the two-call demo (miss → hit)
npm start

# Invalidate the cache (next run will be a miss again)
npm run clear-cache
```

---

## Configuration

`config.json`:

| Field         | Default                    | Description                    |
|---------------|----------------------------|--------------------------------|
| `model`       | `claude-haiku-4-5-20251001`| Anthropic model ID             |
| `maxTokens`   | `256`                      | Maximum tokens in response     |
| `temperature` | `0`                        | Sampling temperature           |

`.env`:

| Variable            | Required | Description         |
|---------------------|----------|---------------------|
| `ANTHROPIC_API_KEY` | Yes      | Anthropic API key   |

---

## Logging

Every run appends to `logs/YYYY-MM-DD.log`. Log levels:

- `INFO`   - general progress
- `STEP`   - start of a major phase
- `RESULT` - assistant reply
- `WARN`   - cache miss or unexpected event
- `ERROR`  - fatal problems

---

## Requirements

- Node.js 18+
- An Anthropic API key with access to `claude-haiku-4-5-20251001`
