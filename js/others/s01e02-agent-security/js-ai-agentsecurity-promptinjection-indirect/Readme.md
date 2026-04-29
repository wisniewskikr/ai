# Indirect Prompt Injection Demo

A CLI application demonstrating how an **indirect prompt injection** attack works against an AI banking assistant.

An indirect injection embeds malicious instructions inside an external document (complaint, FAQ, etc.) that the bot reads. Unlike direct injection (where the user writes the attack), the user may be completely unaware.

---

## Requirements

- Node.js 18+
- OpenRouter API key ([openrouter.ai](https://openrouter.ai))

---

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your API key:

```bash
cp .env.example .env
```

---

## Running

```bash
npm run dev
```

On startup you choose a mode:

| Mode | Behavior |
|---|---|
| **VULNERABLE** | Documents are passed to the model as-is — attacks succeed |
| **PROTECTED** | Documents are scanned with regex before use — known attacks are blocked |

---

## Demo flow

1. Start in **VULNERABLE** mode
2. Load a safe document: type `d1` or `d2` — bot responds normally
3. Load an attack document: type `d3` or `d4` — bot leaks private data (red alert shown)
4. Type `/switch` to switch to **PROTECTED** mode
5. Try `d3` / `d4` again — injection is blocked before reaching the model

### Shortcuts

| Key | Action |
|---|---|
| `q1` | What savings accounts do you offer? |
| `q2` | What are the fees for an international transfer? |
| `q3` | What are your customer service hours? |
| `d1` | Load `complaint_normal.txt` (safe) |
| `d2` | Load `faq_normal.txt` (safe) |
| `d3` | Load `complaint_injected.txt` — role injection attack |
| `d4` | Load `faq_poisoned.txt` — data leak attack |
| `/switch` | Toggle vulnerable / protected mode |
| `/docs` | List available documents |
| `/clear` | Clear conversation history |
| `/help` | Show all commands |
| `exit` | Quit |

---

## Project structure

```
├── src/
│   ├── prompts/
│   │   └── systemPrompt.ts   — bank bot system prompt with public/private data
│   ├── services/
│   │   ├── chat.ts           — REPL loop, command handling, leak detection
│   │   └── openrouter.ts     — OpenRouter API client
│   └── utils/
│       ├── fileReader.ts     — reads documents from documents/ folder
│       ├── validator.ts      — regex-based injection scanner (protected mode)
│       └── logger.ts         — writes logs to logs/
├── documents/
│   ├── complaint_normal.txt
│   ├── complaint_injected.txt  ← attack: role injection
│   ├── faq_normal.txt
│   └── faq_poisoned.txt        ← attack: data leak
├── logs/                       — created automatically
├── config.json                 — model, API URL, shortcuts, limits
├── .env                        — OPENROUTER_API_KEY (never commit)
└── index.ts                    — entry point, mode selection
```

---

## Key limitation of the protected mode

The regex scanner is intentionally simple. It can be bypassed by:
- Encoding / obfuscation (`&#91;ADMIN&#93;`)
- Non-English languages
- Splitting keywords across lines

This is a feature of the demo — it shows that naive defenses are insufficient.
