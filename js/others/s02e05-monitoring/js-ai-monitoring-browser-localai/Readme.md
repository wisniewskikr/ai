# Window Title Tracker — Privacy First

A privacy-focused activity tracker that monitors which applications you use throughout your day, without storing raw window titles or sending data to external servers.

## How It Works

Instead of taking screenshots or recording keystrokes, the tracker:
1. Reads the active window title every 5 seconds
2. Classifies it locally using keyword matching (~80% of cases)
3. Sends only unrecognized titles to a local AI (Ollama) for classification
4. Records only the **category** and **duration** — never the raw window title

```
Active window → title → keyword matching → category → aggregated stats (JSON)
                              ↓ (~20% unrecognized)
                         Ollama (local AI, stays on your machine)
```

## Requirements

- Node.js 18+
- npm
- Ollama (local AI server)

---

## Installing Ollama on Windows

### Step 1: Download the Installer

Go to **https://ollama.com** and click **Download for Windows**.
This downloads `OllamaSetup.exe`.

### Step 2: Run the Installer

Double-click `OllamaSetup.exe` and follow the on-screen instructions.
Ollama installs as a background service and starts automatically after installation.

### Step 3: Verify Ollama Is Running

Open PowerShell or Command Prompt and run:

```
ollama --version
```

Expected output: `ollama version 0.x.x`

### Step 4: Pull the AI Model

Download the model used by this application (~2 GB):

```
ollama pull llama3.2:3b
```

Wait for the download to complete before running the app.

### Step 5: Verify the Model Was Downloaded

```
ollama list
```

You should see `llama3.2:3b` in the list.

### Step 6: Verify the API Is Accessible

```
curl http://localhost:11434
```

Expected response: `Ollama is running`

### Managing Ollama

Ollama starts automatically with Windows. To control it manually:

```
ollama serve          # start the server manually
```

You can also use the **Ollama tray icon** in the Windows system taskbar (bottom-right) to start, stop, or check its status.

---

## Project Installation

```bash
cd js-ai-monitoring-browser-localai
npm install
```

## Running the Application

```bash
npm start
```

## Usage

The application uses a simple CLI. Every prompt accepts `q` to quit immediately.

| Prompt | Options |
|--------|---------|
| `Start monitoring?` | `y` = start, `q` = quit |
| `Stop and show statistics?` | `y` = stop & show stats, `c` = continue, `q` = quit |
| `What next?` | `m` = new monitoring session, `q` = quit |

## Activity Categories

| Category | Examples |
|----------|---------|
| `work` | VS Code, IntelliJ, Excel, Word, Terminal |
| `communication` | Gmail, Slack, Discord, Teams (chat) |
| `meetings` | Zoom, Google Meet, Webex, Whereby |
| `browsing` | Chrome, Firefox, Edge, Brave |
| `entertainment` | YouTube, Netflix, Spotify, Steam, Twitch |
| `other` | Anything not matched — classified by local AI |

The `other` category is the only one that triggers an Ollama API call. Keywords cover ~80% of cases.

## File Structure

```
js-ai-monitoring-browser-localai/
├── src/
│   ├── prompts/
│   │   └── classify.ts        <- AI classification prompt
│   ├── services/
│   │   ├── classifier.ts      <- keyword-first + Ollama classification
│   │   ├── monitor.ts         <- active window title reading (active-win)
│   │   └── stats.ts           <- statistics display and JSON saving
│   ├── utils/
│   │   ├── cli.ts             <- readline helpers: ask, sleep, isYes, isQuit
│   │   └── log.ts             <- log format: [YYYY-MM-DD HH:mm:ss] [LEVEL]
│   └── index.ts               <- main entry point and CLI session loop
├── logs/                      <- session output files (gitignored)
├── config.json                <- all configuration variables
├── .env                       <- environment variables (not committed)
├── .env.example               <- environment variable template
└── Readme.md                  <- this file
```

## Session Output Format

Each session is saved to `logs/session-YYYY-MM-DDTHH-MM-SS.json`:

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

No window titles are ever saved — only categories and durations.

## Configuration

All settings are in `config.json`. No values are hardcoded in the source.

| Key | Default | Description |
|-----|---------|-------------|
| `monitoringIntervalMs` | `5000` | How often to read the active window (ms) |
| `batchSize` | `6` | Number of samples between progress reports |
| `ollamaBaseUrl` | `http://localhost:11434/v1` | Ollama API endpoint |
| `model` | `llama3.2:3b` | AI model for classification |
| `logsDir` | `logs` | Directory for session JSON files |
| `categories` | see file | List of valid activity categories |
