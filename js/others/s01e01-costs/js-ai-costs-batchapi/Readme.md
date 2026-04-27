# js-ai-costs-batchapi

Demo comparing **Standard API** vs **Batch API** on a real business use case: classifying 100 headphone reviews as `positive`, `neutral`, or `negative`.

The Standard API sends requests one by one (like individual taxi rides). The Batch API sends them all at once (like a bus with 100 passengers) — slower to respond, but ~50% cheaper.

## Requirements

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key — used for Standard API
- An [OpenAI](https://platform.openai.com) API key — used for Batch API (OpenRouter does not support the OpenAI Batch endpoints)

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in both API keys:

```bash
cp .env.example .env
```

```
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=sk-...
```

## Running

```bash
npm start
```

The program will:
1. Send all 100 reviews sequentially via Standard API — logs each result in real time
2. Submit all 100 reviews as a single Batch API job — polls every 10s until complete
3. Print a cost and time comparison

## Expected output

```
Headphone Review Analysis
=========================

--- Standard API ---
[1/100] "Amazing sound quality, very comfortable to wear all day..." -> positive
[2/100] "Best headphones I've ever owned..." -> positive
...
Standard API done. Duration: ~45s, Cost: $0.000420

--- Batch API ---
Batch created: batch_xxx. Waiting for results...
[polling] Status: in_progress... (10s elapsed)
[polling] Status: completed!
Batch API done. Duration: ~120s, Cost: $0.000210

=== Summary ===
Standard API:     45.2s  |  cost: $0.000420
Batch API:        118.4s |  cost: $0.000210
Savings:          $0.000210  (50%)
Matching results: 100/100
```

## Project structure

```
js-ai-costs-batchapi/
├── src/
│   ├── prompts/
│   │   └── classify.ts      # sentiment classification prompt
│   ├── services/
│   │   ├── standard.ts      # sequential API calls
│   │   ├── batch.ts         # batch job: upload, create, poll, parse
│   │   └── compare.ts       # prints cost/time comparison
│   └── index.ts             # entry point
├── data/
│   └── reviews.json         # 100 headphone reviews
├── logs/                    # timestamped log files (auto-created)
├── config.json              # model, pricing, poll interval, timeouts
├── .env                     # OPENROUTER_API_KEY + OPENAI_API_KEY (never commit)
├── .env.example             # template
├── package.json
└── tsconfig.json
```

## Configuration

All tunable values live in `config.json`:

| Key | Description |
|-----|-------------|
| `model` | Model ID for Standard API via OpenRouter (e.g. `openai/gpt-4o-mini`) |
| `batchModel` | Model ID for Batch API via OpenAI directly (e.g. `gpt-4o-mini`) |
| `openrouterBaseUrl` | OpenRouter base URL |
| `openaiBaseUrl` | OpenAI base URL |
| `batchPollIntervalMs` | How often to poll batch status (default: 10s) |
| `batchMaxWaitMs` | Max wait before timeout (default: 10 min) |
| `inputCostPer1MTokens` | Input token price per 1M tokens |
| `outputCostPer1MTokens` | Output token price per 1M tokens |
| `batchCostMultiplier` | Batch discount multiplier (default: 0.5) |

## When to use Batch API

- You have 50+ requests to process
- You do not need results immediately (reports, nightly analysis)
- You want to cut costs without changing output quality
