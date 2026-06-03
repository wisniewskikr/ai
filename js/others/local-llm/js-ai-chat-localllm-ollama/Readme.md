# JS AI Chat — Local LLM (Ollama)

A TypeScript chatbot that talks to an AI running **on your own computer**. No internet. No cloud. Like having a brain in a box.

---

## Requirements

- [Node.js](https://nodejs.org) 20+
- [Ollama](https://ollama.com/download/windows) installed and running

---

## Quick Start

```bash
ollama pull llama3.2
npm install
npm run dev
```

That's it. You're talking to a local AI.

---

## Chat Commands

| Command  | What it does          |
|----------|-----------------------|
| `/clear` | Forget the conversation, start fresh |
| `/exit`  | Quit the app          |

---

## Configuration

**`config.json`** — all settings (model, host, system prompt, log dir):

```json
{
  "ollama": {
    "host": "http://localhost:11434",
    "model": "llama3.2",
    "systemPrompt": "You are a helpful assistant. Be brief."
  },
  "logging": {
    "dir": "logs",
    "level": "INFO"
  }
}
```

**`.env`** — secrets only (copy from `.env.example`):

```env
OPENROUTER_API_KEY=   # optional, for future cloud integration
```

---

## Project Structure

```
project/
├── src/
│   ├── prompts/      ← system prompt (edit without touching logic)
│   ├── services/     ← chat logic (Ollama calls, history)
│   └── utils/        ← logger
├── logs/             ← auto-created, daily log files
├── config.json       ← all config variables
├── .env              ← secrets
└── .env.example      ← template for .env
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `connection refused` on port 11434 | Ollama not running | Run `ollama serve` |
| Very slow responses | Not enough RAM / no GPU | Use a smaller model (3B) |
| `model not found` | Model not downloaded | `ollama pull llama3.2` |
| Terminal freezes | Missing stream | Make sure `stream: true` is set |
| Port 11434 busy | Another process | `netstat -ano \| findstr 11434` — find and kill it |
