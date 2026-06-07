# AI Memory — Context Enrichment Demo

> Think of it like a library card. A plain card says *"Hobbit — adventure story"*. An enriched card adds *"Author: Tolkien, Series: Lord of the Rings, Genre: fantasy"*. The enriched one is found way more often — and that's exactly what this app demonstrates.

---

## What it does

Asks the same question to AI **twice** — once with plain document descriptions, once with enriched ones — and shows you the difference.

| Step | What happens |
|------|-------------|
| 1 | AI gets plain docs → answers poorly (no dependencies) |
| 2 | Documents get enriched (tags, usedBy, dependencies added) |
| 3 | AI gets enriched docs → answers correctly and in detail |

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| OpenRouter API key | [openrouter.ai](https://openrouter.ai) |

---

## Setup

```bash
npm install
cp .env.example .env   # then paste your OpenRouter API key into .env
```

---

## Run

```bash
npm start
```

Pick a question from the menu, watch AI struggle with plain context, then nail it with enriched context.

---

## Knowledge base

10 company documents used in the demo:

| Document | Description |
|----------|-------------|
| Project Alpha | E-commerce system |
| Project Beta | Admin panel |
| Project Gamma | Mobile app |
| Project Delta | Reporting system |
| Payment API | Online payments module |
| Auth Service | Login & authorization |
| Notification Service | Email / SMS delivery |
| Database Core | Main database |
| File Storage | File & media storage |
| Audit Logger | System event journal |

**Plain doc:**
```
Payment API: Module for handling online payments.
```

**Enriched doc:**
```
Payment API: Module for handling online payments.
  Dependencies: Database Core.
  Used by: Project Alpha, Project Beta, Project Gamma.
  Tags: Stripe, PayU, transactions, invoice, billing.
```

---

## File structure

```
project/
├── src/
│   ├── prompts/
│   │   ├── system.ts            # AI system prompt
│   │   └── question-context.ts  # prompt template with context
│   ├── services/
│   │   ├── ai-client.ts         # OpenRouter client (retry, timeout)
│   │   ├── enricher.ts          # plain vs enriched document formatters
│   │   └── compare.ts           # 3-step comparison logic
│   └── utils/
│       ├── knowledge-base.ts    # 10 raw documents
│       └── logger.ts            # writes logs to /logs
├── logs/                        # auto-generated log files
├── config.json                  # model, timeout, retry settings
├── index.ts                     # CLI entry point
├── .env                         # your API key (never commit!)
└── .env.example                 # key template
```

---

## Config

Edit `config.json` to change model or tweak timeouts:

```json
{
  "model": "google/gemma-3-27b-it:free",
  "timeout_ms": 30000,
  "retry_limit": 3,
  "retry_delay_ms": 2000
}
```

---

## Key takeaway

> Small additions to documents = big difference in AI answers.
> Context enrichment makes the invisible visible.
