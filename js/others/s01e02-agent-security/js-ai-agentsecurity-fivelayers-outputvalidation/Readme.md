# Bank Assistant AI — Output Validation Demo

A TypeScript CLI chat application demonstrating a **5-layer output validation pipeline** for AI agents. The context is a fictional bank assistant — every model response is inspected by 5 validators before reaching the user.

> **Reference:** Layer 3 of 5 defense layers for AI agents (Output Validation).

---

## What it demonstrates

| Option | Trigger | Layer blocked |
|--------|---------|---------------|
| [1] Account balance | Real API call — passes all layers | — |
| [2] Term deposit info | Real API call — passes all layers | — |
| [3] System prompt leak | Simulated full prompt dump exceeding 2000 characters | Layer 1: Structural |
| [4] Credit card number | Simulated response with Luhn-valid card | Layer 2: Pattern |
| [5] Phishing URL | Simulated response with external link | Layer 3: Semantic |
| [6] Cooking recipe | Simulated off-topic response | Layer 4: Contextual |
| [7] XSS script tag | Simulated `<script>alert(1)</script>` | Layer 5: Sanitization |
| [8] Custom question | Your own input to the model | all layers |

---

## Requirements

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

---

## Installation

```bash
npm install
```

Copy the environment template and add your key:

```bash
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY
```

---

## Usage

```bash
npm start
```

Select a client (Jan Kowalski or Anna Nowak), then choose an option from the menu.

---

## Project structure

```
src/
  index.ts              — main CLI loop (readline)
  openrouter.ts         — OpenRouter API client
  pipeline.ts           — runs all 5 validators in sequence
  config.ts             — re-exports config.json
  types.ts              — shared TypeScript types
  prompts/
    bank-assistant.ts   — system prompt template (inject client data)
    judge.ts            — LLM-as-judge prompt (semantic layer)
  utils/
    clients.ts          — mock client data (Jan Kowalski, Anna Nowak)
    logger.ts           — file logger (logs/app.log)
    luhn.ts             — Luhn algorithm for credit card validation
  validators/
    1-structural.ts     — length and encoding checks
    2-pattern.ts        — regex/keyword detection (cards, keys, injections)
    3-semantic.ts       — LLM-as-judge classification
    4-contextual.ts     — off-topic and grounding checks
    5-sanitization.ts   — HTML stripping, URL filtering, redaction
config.json             — all configuration (models, limits, allowed domains)
logs/                   — runtime logs (created automatically)
```

---

## Configuration

All tunable parameters are in `config.json`:

| Key | Default | Description |
|-----|---------|-------------|
| `mainModel` | `anthropic/claude-haiku-4-5` | Model for chat responses |
| `judgeModel` | `anthropic/claude-haiku-4-5` | Model for semantic validation |
| `maxResponseLength` | `2000` | Max chars before BLOCK |
| `minResponseLength` | `2` | Min chars before BLOCK |
| `allowedDomains` | `["bank.pl"]` | Domains allowed in URLs |
| `maxTokens.main` | `500` | Token limit for chat model |
| `maxTokens.judge` | `20` | Token limit for judge model |

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key (required) |
