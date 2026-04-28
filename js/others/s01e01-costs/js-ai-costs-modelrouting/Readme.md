# js-ai-costs-modelrouting

A CLI demo showing how to reduce AI costs by routing queries to different models based on complexity.

## How it works

```
Query
  ↓
Classifier Agent → "simple" or "complex"
  ↓
Simple Agent          Complex Agent
(cheap, fast)         (accurate, detailed)
  ↓                        ↓
        Answer
   + agent used
   + estimated cost
```

## Agents

| Agent | Model | Role |
|---|---|---|
| Classifier | `meta-llama/llama-3.1-8b-instruct` | Classifies query as simple or complex |
| Simple Agent | `google/gemini-2.5-flash-lite` | Handles simple queries — fast and cheap |
| Complex Agent | `anthropic/claude-sonnet-4.5` | Handles complex queries — detailed and accurate |

## Requirements

- Node.js 20+
- OpenRouter API key

## Installation

```bash
npm install
cp .env.example .env
# Fill in OPENROUTER_API_KEY in .env
```

## Usage

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

On startup the app displays example queries. Enter a number to select one, or type your own question. Type `/exit` to quit.

## File structure

```
├── src/
│   ├── prompts/           # System prompts for each agent
│   ├── services/          # Classifier, agents, router logic
│   └── utils/             # API client, config loader, logger
├── logs/                  # Daily log files (YYYY-MM-DD.log)
├── config.json            # Models, pricing, example queries
├── .env                   # API key (never commit)
└── .env.example           # Template
```

## Configuration

Edit `config.json` to change models, pricing, max tokens, or example queries — no code changes needed.
