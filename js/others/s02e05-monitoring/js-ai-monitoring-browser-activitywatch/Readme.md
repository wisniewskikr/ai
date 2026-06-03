# Browser Activity Tracker — Privacy First

A demo project illustrating the difference between traditional user monitoring and a Privacy First approach.

**Traditional tracker** — screenshots every 5s, analysis on a remote server, raw content stored, accessible to company/server/attacker.
**This tracker** — monitors browser windows only, classifies by tab title locally, records only a category + time. Non-browser windows are ignored entirely.

```
ActivityWatch API → app + title → browser gate → keyword classification → category → aggregated JSON
       ↑                 ↑              ↑                                                  ↑
  local server    NOT recorded   non-browser = skip                          the only thing saved
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
| `monitoringIntervalMs` | `5000`                                              | Sampling interval in milliseconds                  |
| `batchSize`          | `6`                                                   | Samples per batch before asking to stop            |
| `activityWatchUrl`   | `http://localhost:5600/api/0`                         | ActivityWatch API base URL                         |
| `logsDir`            | `logs`                                                | Directory for session JSON files                   |
| `categories`         | `["idle","communication","meetings","entertainment","browsing"]` | Activity categories              |
| `browserApps`        | `["chrome","firefox","msedge","edge","brave","safari"]` | Process names treated as browsers              |

---

## Activity Categories

Only browser windows are monitored. If the active window is not a browser (e.g. VSCode, Spotify, Terminal), the sample is silently skipped and does not appear in statistics.

Classification is based solely on the browser tab title (keyword-first). The list of tracked browsers is configurable via `browserApps` in `config.json`.

| Category        | How detected                             | Title keywords                                        |
|-----------------|------------------------------------------|-------------------------------------------------------|
| `idle`          | `aw-watcher-afk` status = "afk"          | (not keyword-based)                                   |
| `communication` | browser tab title                        | gmail, outlook, slack, discord, teams, mail           |
| `meetings`      | browser tab title                        | zoom, meet, webex, whereby                            |
| `entertainment` | browser tab title                        | youtube, netflix, disney, hbo, spotify, twitch, steam, vimeo |
| `browsing`      | fallback — no keyword matched            | (any other browser tab)                               |

Classification is 100% local — keyword-first, no external AI calls.

---

## Session Logs

Each session is saved as a JSON file in `logs/`:

```json
{
  "sessionStart": "2026-06-03T10:30:00.000Z",
  "sessionEnd": "2026-06-03T10:35:00.000Z",
  "totalSeconds": 120,
  "categories": {
    "idle": 0,
    "communication": 60,
    "meetings": 0,
    "entertainment": 30,
    "browsing": 30
  }
}
```

Non-browser time (VSCode, Spotify, Terminal, etc.) does not appear in the log — those samples are skipped entirely.

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
