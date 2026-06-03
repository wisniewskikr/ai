# Window Title Tracker — Privacy First

> Like a diary that writes only "I worked" — never what you actually wrote.

Tracks how you spend time on your computer. Saves **only the category** (e.g. `work`, `browsing`), never the window title itself. Everything runs locally — no data leaves your machine.

## How It Works

```
Active window → title → keywords → category → stats (JSON)
                              ↓ no match (~20%)
                         Ollama (local AI, your machine only)
```

| Step | What happens |
|------|-------------|
| Every 5s | Reads the active window title |
| Keywords | Classifies ~80% of titles instantly, no AI needed |
| Ollama | Called only for the remaining ~20% |
| Saved | Only the category + duration, never the raw title |

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | any |
| Ollama | latest |

---

## Install Ollama on Windows

### 1. Download

Go to **https://ollama.com** → click **Download for Windows** → run `OllamaSetup.exe`.

Ollama installs silently as a background service. It starts automatically with Windows.

### 2. Verify installation

```bash
ollama --version
# ollama version 0.x.x
```

### 3. Download the AI model (~2 GB)

```bash
ollama pull llama3.2:3b
```

### 4. Check the model is ready

```bash
ollama list
# llama3.2:3b   ...
```

### 5. Check the API is running

```bash
curl http://localhost:11434
# Ollama is running
```

### Managing Ollama

Ollama starts with Windows automatically. To start it manually:

```bash
ollama serve
```

Or right-click the **Ollama tray icon** (system taskbar, bottom-right).

---

## Install & Run

```bash
npm install
npm start
```

## Usage

Every prompt accepts `q` to quit immediately.

| Prompt | Keys |
|--------|------|
| `Start monitoring?` | `y` start · `q` quit |
| `Stop and show statistics?` | `y` stop · `c` continue · `q` quit |
| `What next?` | `m` new session · `q` quit |

## Categories

| Category | Matched by | Examples |
|----------|-----------|---------|
| `work` | keyword | VS Code, IntelliJ, Excel, Terminal |
| `communication` | keyword | Gmail, Slack, Discord, Teams |
| `meetings` | keyword | Zoom, Google Meet, Webex |
| `browsing` | keyword | Chrome, Firefox, Edge, Brave |
| `entertainment` | keyword | YouTube, Netflix, Spotify, Steam |
| `other` | **Ollama** | Anything not matched above |

## File Structure

```
js-ai-monitoring-browser-localai/
├── src/
│   ├── prompts/classify.ts      <- AI prompt
│   ├── services/
│   │   ├── classifier.ts        <- keyword + Ollama logic
│   │   ├── monitor.ts           <- reads active window
│   │   └── stats.ts             <- display + save JSON
│   ├── utils/
│   │   ├── cli.ts               <- ask, sleep, isYes, isQuit
│   │   └── log.ts               <- [YYYY-MM-DD HH:mm:ss] [LEVEL]
│   └── index.ts                 <- main loop
├── logs/                        <- session files (gitignored)
├── config.json                  <- all settings
└── .env                         <- secrets (not committed)
```

## Session Output

Saved to `logs/session-YYYY-MM-DDTHH-MM-SS.json`:

```json
{
  "session": "2026-06-03T10-30-00",
  "totalSeconds": 1500,
  "samples": 300,
  "categories": {
    "work": 930,
    "browsing": 480,
    "other": 90
  }
}
```

## Configuration (`config.json`)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `monitoringIntervalMs` | `5000` | How often to sample (ms) |
| `batchSize` | `6` | Samples before asking to stop |
| `ollamaBaseUrl` | `http://localhost:11434/v1` | Ollama API address |
| `model` | `llama3.2:3b` | AI model |
| `logsDir` | `logs` | Where to save sessions |
| `categories` | see file | Valid category names |
