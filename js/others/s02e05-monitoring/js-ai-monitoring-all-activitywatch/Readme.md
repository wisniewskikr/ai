# Window Title Tracker — Privacy First

A demo project illustrating the difference between traditional user monitoring and a Privacy First approach.

**Traditional tracker** — screenshots every 5s, analysis on a remote server, raw content stored, accessible to company/server/attacker.
**This tracker** — reads only the active window title, classifies locally by keyword, records only a category + time. Only you see the data.

```
ActivityWatch API → app + title → keyword classification → category → aggregated JSON
       ↑                 ↑                                                  ↑
  local server    NOT recorded                                  the only thing saved
```

---

## Requirements

| Requirement              | How to verify                                                    |
|--------------------------|------------------------------------------------------------------|
| Node.js >= 18            | `node --version`                                                 |
| ActivityWatch `aw-server`| Open `http://localhost:5600` — server must respond               |
| `aw-watcher-window`      | Must be running (creates bucket `aw-watcher-window_*`)           |
| `aw-watcher-afk`         | Must be running (creates bucket `aw-watcher-afk_*`)              |

---

## Installing ActivityWatch on Windows

### Step 1 — Download ActivityWatch

1. Go to the [ActivityWatch releases page](https://github.com/ActivityWatch/activitywatch/releases).
2. Download the latest Windows release — file named `activitywatch-*-windows-x86_64.zip`.
3. Extract the ZIP to a folder of your choice, e.g. `C:\ActivityWatch`.

### Step 2 — Start ActivityWatch

1. Open File Explorer and go to the folder where you extracted ActivityWatch.
2. Double-click `aw-qt.exe` — this starts the ActivityWatch system tray application.
3. A tray icon appears in the Windows system tray (bottom-right corner).
4. ActivityWatch automatically starts `aw-server`, `aw-watcher-window`, and `aw-watcher-afk`.

### Step 3 — Verify ActivityWatch is running

1. Open your browser and go to `http://localhost:5600`.
2. You should see the ActivityWatch dashboard.
3. Click **Buckets** — you should see `aw-watcher-window_<hostname>` and `aw-watcher-afk_<hostname>` listed.

### Step 4 — (Optional) Start ActivityWatch automatically with Windows

1. Right-click the ActivityWatch tray icon and select **Launch at login**.
2. ActivityWatch will now start automatically when Windows boots.

### Troubleshooting

| Problem                              | Solution                                                             |
|--------------------------------------|----------------------------------------------------------------------|
| `http://localhost:5600` not loading  | Run `aw-qt.exe` again; check if Windows Firewall is blocking port 5600 |
| No buckets visible in dashboard      | Wait 30 seconds after start; watchers need time to create buckets    |
| `aw-watcher-window_*` bucket missing | Ensure `aw-watcher-window` process is running (visible in Task Manager) |
| Port 5600 conflict                   | Another process is using port 5600 — find and stop it               |

---

## Installation

```bash
npm install
```

---

## Running

```bash
npm start
```

If `aw-server` is not reachable or a required bucket is missing, the application prints a clear error message and exits — no silent fallback.

---

## Configuration

All settings are in `config.json` — no hardcoded values in code.

| Key                  | Default                          | Description                              |
|----------------------|----------------------------------|------------------------------------------|
| `monitoringIntervalMs` | `5000`                         | Sampling interval in milliseconds        |
| `batchSize`          | `6`                              | Samples per batch before asking to stop  |
| `activityWatchUrl`   | `http://localhost:5600/api/0`    | ActivityWatch API base URL               |
| `logsDir`            | `logs`                           | Directory for session JSON files         |
| `categories`         | see config.json                  | Ordered list of activity categories      |

---

## Activity Categories

| Category        | Detected by app (examples)               | Detected by title (keywords)                         |
|-----------------|------------------------------------------|------------------------------------------------------|
| `idle`          | `aw-watcher-afk` status = "afk"          | (not keyword-based)                                  |
| `work`          | Code, cursor, idea64, EXCEL, WINWORD     | vscode, code, intellij, excel, word, cursor, vim     |
| `meetings`      | zoom, whereby, ms-teams                  | zoom, meet, webex, whereby                           |
| `communication` | Slack, Discord, OUTLOOK, thunderbird     | gmail, outlook, slack, discord, teams, mail          |
| `browsing`      | chrome, firefox, msedge, brave           | chrome, firefox, edge, brave, safari                 |
| `entertainment` | Spotify, steam, vlc, Netflix             | youtube, netflix, disney, hbo, spotify, twitch, steam, vimeo |
| `other`         | (anything else)                          | (no keyword match)                                   |

Classification is 100% local — keyword-first, no external AI calls.

---

## Session Logs

Each session is saved as a JSON file in `logs/`:

```json
{
  "sessionStart": "2026-06-03T10:30:00.000Z",
  "sessionEnd": "2026-06-03T10:35:00.000Z",
  "totalSeconds": 300,
  "categories": {
    "work": 210,
    "browsing": 60,
    "idle": 30,
    "communication": 0,
    "meetings": 0,
    "entertainment": 0,
    "other": 0
  }
}
```

Raw window titles are never recorded — only categories and time.

---

## File Structure

```
js-ai-monitoring-browser-activitywatch/
├── src/
│   ├── services/
│   │   ├── activitywatch.ts   — ActivityWatch REST API client
│   │   ├── classifier.ts      — keyword-first category classification
│   │   └── stats.ts           — statistics display and JSON saving
│   ├── utils/
│   │   └── cli.ts             — readline helpers: ask(), sleep(), log(), isYes(), isQuit()
│   └── index.ts               — main entry point, CLI flow, session loop
├── logs/                      — session output files (gitignored)
├── config.json                — all configuration variables
├── package.json
├── tsconfig.json
└── Readme.md
```
