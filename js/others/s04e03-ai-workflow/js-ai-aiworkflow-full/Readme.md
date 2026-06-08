# AI Workflow — Silent Degradation Demo

> **Analogy:** A fridge stops cooling, but the light inside still works. Everything looks fine — until the food starts to smell.
> This project shows how to prevent the same thing from happening in your AI workflow.

---

## What is it?

A TypeScript demo that shows two techniques for preventing silent AI workflow failures:

| Technique | What it does |
|-----------|-------------|
| **Retry (Exponential Backoff + Jitter)** | Retries failed API calls intelligently |
| **Monitoring (3 layers)** | Watches if the workflow runs *and if the output makes sense* |

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
cd js-ai-aiworkflow-basic

cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

npm install
```

---

## Run

```bash
npm run dev                        # loop, 3 articles/min
npm run dev -- --articles 5 --once # run once, 5 articles
npm run dev -- --dry-run           # fetch articles, skip LLM calls
npm run dev -- --help              # show all options
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--articles <n>` | 3 | Articles to process per run |
| `--interval <ms>` | 60000 | Milliseconds between runs |
| `--once` | false | Run once and exit |
| `--dry-run` | false | Fetch articles, skip LLM calls |

Logs appear in the console and in `logs/app.log`.
Articles are saved to `workflow/articles/`.

---

## File structure

```
src/
├── prompts/summarize.md    ← edit AI prompts here, no code changes needed
├── services/
│   ├── llm-client.ts       ← OpenRouter calls with p-retry
│   ├── news-fetcher.ts     ← Hacker News API with mock fallback
│   └── monitor.ts          ← 3-layer monitoring (pino)
├── utils/
│   ├── cli.ts              ← commander, ora spinners, chalk colors
│   └── mock-articles.ts    ← fallback data for offline testing
├── config.ts               ← Zod validation of config.json
└── index.ts                ← entry point, runs the workflow loop
workflow/articles/          ← output JSON files (one per article)
logs/app.log                ← structured logs (auto-created)
config.json                 ← all config values (no secrets)
.env                        ← API keys (never commit!)
```

---

## Configuration

All settings live in `config.json`:

| Key | What it controls |
|-----|--------------------|
| `model` | LLM model via OpenRouter |
| `retry.attempts` | Max retry attempts per LLM call |
| `retry.factor` | Backoff multiplier (2 = doubles each time) |
| `retry.minTimeoutMs` | Initial wait before first retry |
| `monitor.minSummaryLength` | Alert if summary shorter than N characters |
| `monitor.schemaErrorRateAlertThreshold` | Alert threshold for JSON schema errors |
| `workflow.intervalMs` | How often to run (milliseconds) |
| `workflow.articles` | Articles to fetch per run |

---

## Output format

Each processed article is saved as `workflow/articles/{timestamp}-{id}.json`:

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

## Monitoring layers

| Layer | What it checks |
|-------|---------------|
| **Layer 1 — Infra** | API response time, token usage, error rate |
| **Layer 2 — Pipeline** | Throughput, retry rate, failed articles |
| **Layer 3 — Quality** | JSON schema validity, summary length, canary check |

The **canary check** runs before every batch: it sends a simple prompt with a known correct answer (`{"ok": true}`) to detect model drift or API issues before processing real articles.

---

> **One sentence:** Build workflows as if every external call can fail — because sooner or later, it will.
