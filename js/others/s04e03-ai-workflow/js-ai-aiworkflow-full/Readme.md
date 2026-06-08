# AI Workflow — Silent Degradation Demo

> **Analogy:** A fridge stops cooling, but the light inside still works. Everything looks fine — until the food starts to smell.
> This project shows how to prevent the same thing from happening in your AI workflow.

---

## What is it?

A TypeScript demo showing four techniques that keep AI workflows alive when things go wrong.

| Technique | Analogy | What it does |
|-----------|---------|--------------|
| **Retry + Backoff** | Miss a bus? Wait, then try again | Retries failed API calls with increasing delays |
| **Monitoring (3 layers)** | Doctor checking pulse + blood test + X-ray | Watches infra, data flow, *and* output quality |
| **Circuit Breaker** | Electrical fuse that trips automatically | Stops hammering a broken API. Tries again later |
| **Dead Letter Queue** | Post office "undeliverable" shelf | Saves failed jobs so nothing is lost |

The demo fetches Hacker News articles every minute, sends them to an LLM via OpenRouter, and saves structured JSON summaries.

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | >= 18 |
| npm | >= 9 |
| OpenRouter API key | free tier works |

---

## Installation

```bash
git clone <repo>
cd js-ai-aiworkflow-full

cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

npm install
```

---

## Run

```bash
npm run dev
```

On startup you'll see an interactive menu:

```
AI Workflow — Silent Degradation Demo
======================================

? What do you want to do?
  1) Run normally
  2) Recover articles from DLQ
  3) Simulate retry failure (DLQ: retry_exhausted)
  4) Simulate monitoring failure (canary check) (no DLQ)
  5) Simulate Circuit Breaker failure (DLQ: retry_exhausted → breaker_open)
  0) Exit
```

| Option | What happens |
|--------|-------------|
| **1** Run normally | Fetch articles, call LLM, save results |
| **2** Recover from DLQ | Reprocess all failed articles, then return to menu |
| **3** Simulate retry failure | Watch exponential backoff in action; failed articles pushed to DLQ as `retry_exhausted` |
| **4** Simulate canary failure | Canary fails before any articles are processed — **no DLQ entries** |
| **5** Simulate Circuit Breaker | Breaker trips: closed → open → half-open; articles go to DLQ as `retry_exhausted` then `breaker_open` |
| **0** Exit | Graceful shutdown — the only way to exit |

After each task the menu reappears automatically. Ctrl+C during a task stops it gracefully and returns to the menu.

Options 3–5 use mock responses — **no tokens spent**.

### CLI flags (skip the menu)

```bash
npm run dev -- --once              # run once and exit
npm run dev -- --articles 5        # process 5 articles per run
npm run dev -- --dry-run           # fetch articles, skip LLM calls
npm run dev -- --reprocess-dlq     # recover from DLQ and exit
npm run dev -- --help              # show all options
```

---

## File structure

```
src/
├── prompts/summarize.md        ← edit AI prompts here, no code changes needed
├── services/
│   ├── llm-client.ts           ← OpenRouter calls with p-retry + circuit breaker
│   ├── news-fetcher.ts         ← Hacker News API with mock fallback
│   ├── circuit-breaker.ts      ← opossum circuit breaker (3 states)
│   ├── dlq.ts                  ← Dead Letter Queue — SQLite
│   └── monitor.ts              ← 3-layer monitoring (pino)
├── utils/
│   ├── cli.ts                  ← inquirer menu, commander flags, ora, chalk
│   ├── simulate.ts             ← mock responses for options 3–5
│   └── mock-articles.ts        ← fallback data for offline testing
├── config.ts                   ← Zod validation of config.json
└── index.ts                    ← entry point, runs the workflow loop
workspace/
├── articles/                   ← output JSON files (one per article)
└── dlq.db                      ← failed jobs (SQLite, auto-created)
logs/app.log                    ← structured logs (auto-created)
config.json                     ← all config values (no secrets)
.env                            ← API keys (never commit!)
```

---

## Configuration

All settings live in `config.json` — no hardcoded values in code:

| Key | What it controls |
|-----|-----------------|
| `model` | LLM model via OpenRouter |
| `retry.attempts` | Max retry attempts per LLM call |
| `retry.factor` | Backoff multiplier (2 = doubles each time) |
| `retry.minTimeoutMs` | Initial wait before first retry |
| `circuitBreaker.failureThreshold` | % failures before breaker opens |
| `circuitBreaker.timeoutMs` | Max time for a single LLM call |
| `circuitBreaker.resetTimeoutMs` | How long breaker stays open before half-open |
| `monitor.minSummaryLength` | Alert if summary shorter than N characters |
| `dlq.reprocessBatchSize` | Max DLQ items to reprocess per run |
| `dlq.maxSize` | Max DLQ size before backpressure kicks in |
| `workflow.intervalMs` | How often to run (milliseconds) |
| `workflow.articles` | Articles to fetch per run |

---

## How it works together

```
Every run:
  1. Canary check (every 10 runs or after errors)
  2. Reprocess pending DLQ items (if circuit is closed)
  3. Fetch new articles from Hacker News
     └── For each article:
           retry → circuit breaker → LLM API
                          ↓ on failure
                       Dead Letter Queue
  4. Log metrics (infra + pipeline + quality)
```

---

## Output format

Each processed article is saved as `workspace/articles/{timestamp}-{id}.json`:

```json
{
  "id": 43821,
  "fetchedAt": "2026-06-08T10:01:00.000Z",
  "title": "OpenAI raises $40B at $300B valuation",
  "text": "...",
  "summary": "OpenAI secured $40B in funding...",
  "topics": ["AI", "funding", "OpenAI"]
}
```

---

## Console output

Each article shows a live spinner during processing. After all articles finish, a table summarises the run — one row per article:

```
  [1/3] Processing: "OpenAI raises $40B at $300B valuation"
        ✔ Done (891ms)
  [2/3] Processing: "TypeScript 5.8 released"
        ⚠ Retry 1/4 — rate limit (429)...
        ✔ Done (2103ms)
  [3/3] Processing: "Show HN: I built a..."
        ✖ Failed: Breaker is open

  Article                                 Retries  Breaker  Schema  Length  Status
  ──────────────────────────────────────────────────────────────────────────────────
  OpenAI raises $40B at $300B valuation      0       ok       ok      ok    ✓ saved
  TypeScript 5.8 released                    1       ok       ok      ok    ✓ saved
  Show HN: I built a...                      3       open     -       -     ✗ DLQ
```

| Column | What it shows |
|--------|--------------|
| **Article** | Title (truncated to 38 chars) |
| **Retries** | Retry count (yellow when > 0) |
| **Breaker** | Circuit breaker state at processing time (`ok` / `open`) |
| **Schema** | Whether LLM output has required `summary` and `topics` fields |
| **Length** | Whether summary meets minimum length from `config.json` |
| **Status** | `✓ saved` / `✗ DLQ` / `→ skipped` / `(dry-run)` |

`-` means not applicable (e.g. schema and length when breaker was open — LLM was never called). Canary check is per-run, shown in the summary section below the table.

---

## Monitoring layers

| Layer | What it checks |
|-------|---------------|
| **Layer 1 — Infra** | API latency, token usage, error rate, circuit breaker state |
| **Layer 2 — Pipeline** | Throughput, retry rate, failed count, DLQ size |
| **Layer 3 — Quality** | JSON schema validity, summary length, canary check |

The **canary check** sends a simple prompt with a known answer (`{"ok": true}`) to detect model drift before processing real articles. Runs every 10 cycles or after any failure.

---

> **One sentence:** Build workflows as if every external call can fail — because sooner or later, it will.
