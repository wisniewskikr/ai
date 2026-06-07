# AI Memory Demo: Knowledge Graph

> Think of it like a family tree — you always know who is whose boss, in milliseconds.

---

## What does it do?

It lets you ask questions about a company's org chart. Instead of asking an AI to *guess*, it looks up the answer in a graph — like a map of who reports to whom.

| Question | How it answers |
|---|---|
| "Who reports to Bob?" | Instant graph lookup — always correct |
| "Who is Grace's manager?" | Instant graph lookup — always correct |
| "How many people does Alice manage?" | Counts directly from the graph |

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| OpenRouter API key | [openrouter.ai](https://openrouter.ai) |

**AI model used:** `google/gemini-2.5-flash` (fast, cheap — one call per question)

---

## Installation

```bash
git clone <repo-url>
cd js-ai-aimemory-graf
npm install
cp .env.example .env
# Add your OpenRouter API key to .env
```

---

## How to run

```bash
npm start
```

You'll see a menu:

```
[1] Show full graph (nodes and edges)
[2] Who reports to Bob Johnson?
[3] Who is Grace Wilson's manager?
[4] Ask your own question (AI-powered)
[0] Exit
```

- Options **1–3** use no AI — pure graph, always instant
- Option **4** uses AI to understand your question, then looks up the answer in the graph

---

## File structure

```
data/
  graph.json        ← company org chart (edit to change the data)
src/
  index.ts          ← main CLI loop
  prompts/
    parseQuestion.ts ← AI prompt that extracts who you're asking about
  services/
    graphMemory.ts  ← graph traversal (no AI, no data — just logic)
    openRouter.ts   ← OpenRouter API client
  utils/
    logger.ts       ← writes logs to logs/app.log
logs/
  .gitkeep          ← keeps the folder in git; log files are ignored
config.json         ← model name, token limit, demo question names
.env                ← your API key (never commit this)
.env.example        ← template for .env
```

---

## How option [4] works

One AI call turns your question into a structured query:

```
Your question: "Who does Bob manage?"

AI  →  { "person": "Bob Johnson", "queryType": "direct_reports" }
Graph  →  Dave Brown, Eve Davis
```

The AI only extracts intent — the graph does the actual lookup.
