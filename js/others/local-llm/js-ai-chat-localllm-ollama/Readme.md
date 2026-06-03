# JS AI Chat — Local LLM (Ollama)

A TypeScript chatbot that talks to an AI running **on your own computer**. No internet. No cloud. Like having a brain in a box.

---

## Requirements

- [Node.js](https://nodejs.org) 20+
- Ollama installed and running (see below)

---

## Installing Ollama on Windows

1. Download `OllamaSetup.exe` from **https://ollama.com/download/windows** and run it. Ollama installs as a system service.
2. Verify:
   ```bash
   ollama --version
   ```
3. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
4. Test the API:
   ```bash
   curl http://localhost:11434/api/tags
   ```

Ollama listens on `http://localhost:11434` by default. Model files are stored in `C:\Users\<YourUser>\.ollama\models`.

### Recommended models

| Model | Size | Good for |
|-------|------|----------|
| `llama3.2` | 2 GB | General use |
| `mistral` | 4 GB | Great overall quality |
| `phi3` | 2.3 GB | Fast, by Microsoft |
| `qwen2.5-coder` | 4.7 GB | Code |

### Hardware requirements

| Model size | Example | RAM | GPU VRAM |
|------------|---------|-----|----------|
| 3B | llama3.2, phi3 | 4 GB | 3 GB |
| 7B | mistral | 8 GB | 6 GB |
| 13B | codellama:13b | 16 GB | 12 GB |
| 70B | llama3:70b | 64 GB | 48 GB |

> No GPU? It still works — just slower. Start with 3B models.

---

## Uninstalling Ollama from Windows

1. Go to **Settings → Apps → Installed apps**, find **Ollama** and click **Uninstall**.
2. Remove leftover model files:
   ```bash
   # CMD
   rmdir /s /q "%USERPROFILE%\.ollama"
   ```
   ```powershell
   # PowerShell
   Remove-Item -Recurse -Force "$env:USERPROFILE\.ollama"
   ```

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
