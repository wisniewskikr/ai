# Ethical Scraper Demo

A scraper that behaves like a polite guest — it knocks before entering, introduces itself, and never makes a mess.

---

## What it does

| Step | Action | Like a polite guest who... |
|------|--------|---------------------------|
| 1 | Checks `robots.txt` | ...reads the "no soliciting" sign on the door |
| 2 | Waits 5 seconds | ...doesn't ring the bell twice in a row |
| 3 | Sends honest User-Agent | ...introduces themselves by name |
| 4 | Detects PII (email/phone) | ...stops if they see private mail on the table |
| 5 | Asks AI for ethical feedback | ...asks a friend: "was that okay?" |

---

## Requirements

- Node.js 18+
- OpenRouter API key

---

## Setup

```bash
npm install
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

---

## Run

```bash
npm start
```

---

## Menu

```
=== Ethical Scraper Demo ===

Choose an example:
  [1] robots.txt BLOCKED   — Wikipedia (bots not allowed)
  [2] robots.txt ALLOWED   — example.com (all clear)
  [3] PII Detection        — iana.org/contacts (has emails → stops)
  [4] Rate Limiting        — 3 URLs with 5s pause between each
  [5] Enter your own URL
  [0] Exit
```

---

## Configuration

Edit `config.json` to change behavior — no code changes needed.

| Key | What it controls | Default |
|-----|-----------------|---------|
| `scraperName` | Your name in User-Agent | `Krzysztof Wisniewski` |
| `scraperEmail` | Your email in User-Agent | `wisniewskikr@gmail.com` |
| `rateLimitMs` | Pause between requests (ms) | `5000` |
| `requestTimeoutMs` | Max wait for response (ms) | `10000` |
| `model` | AI model for ethical feedback | `google/gemini-2.0-flash-001` |
| `exampleUrls` | URLs used in menu options 1–4 | see file |
| `piiPatterns` | Regex patterns for email/phone | see file |

---

## File structure

```
src/
├── prompts/
│   └── scrape-feedback.md   # AI prompt (edit without touching code)
├── services/
│   ├── robots.ts            # robots.txt check
│   ├── scraper.ts           # page fetch + HTTP 429 handling
│   ├── pii-detector.ts      # email/phone detection
│   └── ai-feedback.ts       # OpenRouter call
├── utils/
│   ├── logger.ts            # logs to console + logs/ folder
│   └── menu.ts              # interactive console menu
├── config.ts                # typed config loader
└── index.ts                 # main orchestrator
logs/                        # auto-generated log files
config.json                  # all settings
.env                         # your API key (never commit!)
```

---

## Logs

Each run appends to `logs/scraper-YYYY-MM-DD.log`:

```
[2026-06-07 10:00:01] [INFO] Starting scrape: https://example.com
[2026-06-07 10:00:01] [INFO] robots.txt OK — scraping permitted
[2026-06-07 10:00:06] [INFO] Fetched 1256 characters
[2026-06-07 10:00:06] [INFO] No PII detected
[2026-06-07 10:00:08] [INFO] AI Feedback: This is a public placeholder page... [SAFE]
```
