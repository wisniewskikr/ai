# Intent Router

Think of it as a librarian. You ask a question — the librarian decides which shelf to check.

The LLM (via OpenRouter) reads your question and picks the right engine to answer it.

---

## How it works

| Question type | Example | Engine used |
|---------------|---------|-------------|
| Similarity | "Who is most like Anna?" | Keyword similarity |
| Relation | "Who reports to Jan?" | Graph traversal |
| Global | "Describe the whole company" | GraphRAG summary |

For menu options 1–6, the CLI shows whether the LLM classified correctly:

```
> Question:         "Who reports to Jan?"
> Expected intent:  relation
> Detected intent:  relation
> Verdict:          CORRECT

> Result (graph engine): Jan -> Piotr (Developer), Jan -> Maria (Developer)
```

---

## Requirements

- Node.js >= 20
- OpenRouter API key

---

## Installation

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your key:
   ```bash
   cp .env.example .env
   ```

3. Run:
   ```bash
   npm run dev
   ```

---

## Usage

```
=== Intent Router Demo ===

Select an option:
  1. [Similarity]   Who is most similar to Anna?
  2. [Similarity]   Find someone with leadership skills
  3. [Relation]     Who reports to Jan?
  4. [Relation]     What is the path between Piotr and Ewa?
  5. [Global]       Describe the overall company structure
  6. [Global]       What are the main departments and their responsibilities?
  7. [Custom]       Type your own question
  0. Exit
```

Options 1–6 verify LLM classification (Expected vs Detected).
Option 7 lets you type any question — LLM classifies and routes it.

---

## File structure

```
project/
├── src/
│   ├── prompts/
│   │   └── classifyIntent.md     # edit this to tune the LLM classifier
│   ├── services/
│   │   ├── router.ts             # sends question to LLM, returns intent
│   │   ├── similarityEngine.ts   # keyword-based similarity search
│   │   ├── graphEngine.ts        # graph traversal (reports, paths)
│   │   └── graphragEngine.ts     # global company summary
│   └── utils/
│       ├── logger.ts             # writes logs to logs/
│       ├── config.ts             # loads config.json + .env
│       └── employees.ts          # in-memory test data
├── logs/                         # auto-generated log files
├── index.ts                      # CLI entry point
├── config.json                   # all configuration variables
├── .env                          # your API key (never commit!)
└── .env.example                  # template
```

---

## Configuration (`config.json`)

| Field | Default | What it does |
|-------|---------|--------------|
| `model` | `google/gemini-flash-1.5` | LLM used for classification |
| `requestTimeoutMs` | `10000` | Max wait for LLM response (ms) |
| `maxRetries` | `2` | Retries on timeout |
| `vectorTopK` | `3` | Max results from similarity engine |
| `logLevel` | `info` | `info` / `warn` / `error` |
