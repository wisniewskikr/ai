# AI Grounding Demo

> AI answers with confidence — but sometimes it's just guessing.
> This app asks two models the same question, cross-checks with Wikipedia,
> and uses a third model as a judge — then shows you how sure we really are.

## How it works

Four independent verification layers combine into a single confidence score (0.0–1.0):

| Layer | What it checks | Weight |
|-------|----------------|--------|
| **1. Multi-model** | Do two models from different companies agree? (semantic keyword overlap) | 35% |
| **2. Wikipedia** | Do the answer keywords appear in a Wikipedia article? (coverage score) | 35% |
| **3. Self-confidence** | How confident are the models in their own answers? | 10% |
| **4. Arbiter LLM** | Does a third model judge the answers as consistent? | 20% |

Final score formula:
```
score = (layer1 * 0.35) + (layer2 * 0.35) + (layer3 * 0.10) + (layer4 * 0.20)
```

| Result | Score |
|--------|-------|
| HIGH   | >= 0.8 |
| MEDIUM | >= 0.5 |
| LOW    | < 0.5  |

## Requirements

- Node.js >= 18
- An [OpenRouter](https://openrouter.ai) API key

## Installation

```bash
git clone <repo-url>
cd js-ai-grounding-full
npm install
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

## Run

```bash
npm start
```

## File structure

| File/Directory | Purpose |
|----------------|---------|
| `index.ts` | Entry point |
| `config.json` | All configuration (models, thresholds, weights, questions) |
| `src/prompts/verify.ts` | Prompt for structured model responses |
| `src/prompts/arbiter.ts` | Prompt for the arbiter judge |
| `src/services/openrouter.ts` | OpenRouter API client (timeout + retry) |
| `src/services/wikipedia.ts` | Wikipedia REST API client (coverage score) |
| `src/services/verifier.ts` | Calls both models in parallel (`Promise.all`) |
| `src/services/comparator.ts` | Semantic answer comparison (keyword overlap) |
| `src/services/arbiter.ts` | Layer 4 — arbiter model call |
| `src/services/scorer.ts` | Weighted confidence score calculation |
| `src/services/cache.ts` | In-memory cache to avoid duplicate API calls |
| `src/utils/cli.ts` | CLI menu and main loop |
| `src/utils/logger.ts` | Structured log output to `logs/` |
| `tests/` | Unit tests for comparator, scorer, wikipedia |
| `logs/` | Auto-generated daily log files |

## Configuration

Edit `config.json` to change:

- `models` — swap out any of the three models (modelA, modelB, arbiter)
- `confidence` — adjust HIGH/MEDIUM thresholds
- `weights` — rebalance the four verification layers (must sum to 1.0)
- `verification` — keyword overlap threshold, Wikipedia coverage threshold, timeout, retries
- `questions` — add or remove predefined questions for the CLI menu
