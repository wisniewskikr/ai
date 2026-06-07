# Hybrid Memory Search

A CLI demo showing BM25, Vector Search, and Hybrid Search side by side, with RAG-powered answers via OpenRouter.

## What it does

Runs three search methods against a memory database and displays their scored results in parallel columns:

| Method | How it works | Best for |
|--------|-------------|----------|
| BM25 | Counts matching keywords | Exact keyword queries |
| Vector | Compares meaning (cosine similarity) | Semantic / paraphrased queries |
| Hybrid | Normalized BM25 + Vector with weights | Best of both worlds |

After retrieval, the top hybrid results are sent to an LLM (via OpenRouter) for a final answer.

## Requirements

- Node.js 18+
- An OpenRouter API key

## Installation

```bash
npm install
cp .env.example .env
# Add your key to .env: OPENROUTER_API_KEY=...
```

## Running

```bash
npm start
```

On first run, the embedding model (`Xenova/all-MiniLM-L6-v2`, ~80 MB) is downloaded and cached locally.

## Configuration

`config.json` controls all runtime parameters — no code changes needed:

```json
{
  "model": "openai/gpt-4o-mini",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2",
  "topK": 3,
  "hybridWeights": { "bm25": 0.4, "vector": 0.6 }
}
```

## Memory database

Edit `data/memories.json` to add or change the documents used for retrieval.

## Project structure

```
src/
  prompts/answerPrompt.ts    — LLM prompt template
  services/bm25Search.ts     — BM25 implementation (~50 lines)
  services/vectorSearch.ts   — embedding-based search (cosine similarity)
  services/hybridSearch.ts   — normalizes + fuses BM25 and vector scores
  services/openRouterClient.ts — OpenRouter API call
  utils/logger.ts            — file logger → logs/
  utils/display.ts           — 3-column CLI formatter
  index.ts                   — CLI entry point
data/memories.json           — editable memory database
logs/                        — runtime logs (YYYY-MM-DD.log)
config.json                  — all configuration
.env                         — API key (never commit)
```
