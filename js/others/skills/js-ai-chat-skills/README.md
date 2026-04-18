# Explainer Agent

A CLI agent that explains any topic in two modes — simple or technical — powered by OpenRouter.

The same model, two different skills (prompts): different output for different audiences.

## Requirements

- Node.js 18+
- OpenRouter API key

## Setup

```bash
npm install
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
```

## Run

```bash
# Development (no build step)
npm run dev

# Production
npm run build
npm start
```

## Usage

1. Type your question and press Enter
2. Choose how you want the answer:
   - **1 — Simple**: explained like to a 5-year-old
   - **2 — Technical**: explained for experts

| Command  | Description   |
|----------|---------------|
| `/exit`  | Quit the app  |

## File structure

```
js-ai-chat-skills/
├── src/
│   ├── prompts/
│   │   ├── explain-simple.md    ← skill: explain for beginners
│   │   └── explain-expert.md   ← skill: explain for experts
│   ├── services/
│   │   ├── api.ts              ← OpenRouter API calls
│   │   ├── config.ts           ← config loader
│   │   ├── logger.ts           ← file logger
│   │   └── skillLoader.ts      ← loads skill from file
│   └── index.ts                ← entry point, CLI loop
├── logs/                        ← session logs (YYYY-MM-DD.log)
├── config.json                  ← model, tokens, temperature
├── .env                         ← OPENROUTER_API_KEY (never commit)
├── .env.example                 ← env template
└── README.md
```

## Configuration

Edit `config.json` to change model or parameters.

| Field         | Default                        | Description             |
|---------------|--------------------------------|-------------------------|
| `model`       | `google/gemini-2.0-flash-001`      | OpenRouter model ID     |
| `maxTokens`   | `1024`                         | Max tokens per response |
| `temperature` | `0.7`                          | Sampling temperature    |
| `baseUrl`     | `https://openrouter.ai/api/v1` | API base URL            |

## Skills

Skills are prompt files in `src/prompts/`. Edit them to change agent behavior without touching any code.

| File                       | Mode      | Audience          |
|----------------------------|-----------|-------------------|
| `explain-simple.md`        | Simple    | Beginners, anyone |
| `explain-expert.md`        | Technical | Developers, experts |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`.

Format: `[YYYY-MM-DD HH:mm:ss] [LEVEL] message`

Levels: `INFO`, `WARN`, `ERROR`
