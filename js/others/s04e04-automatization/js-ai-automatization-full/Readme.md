# Daily News Digest Agent

Think of this as a postman who checks the newspaper before delivering it:
is it today's edition? Is it complete? If not — he leaves a note and rings the alarm.

This agent fetches news headlines, asks AI to summarize them, and saves the result.
Every step has a safety check.

---

## Requirements

| Tool    | Version |
|---------|---------|
| Node.js | >= 20   |
| npm     | >= 10   |

---

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your keys:
   ```
   OPENROUTER_API_KEY=your-key-here
   HEALTHCHECK_API_KEY=hcw_...
   HEALTHCHECK_PING_URL=https://hc-ping.com/YOUR-UUID
   ```
4. Set up a free check at [healthchecks.io](https://healthchecks.io):
   - Register → **New Check** → set period to **2 minutes**, grace to **5 minutes**
   - Copy the ping URL to `HEALTHCHECK_PING_URL` in `.env`
   - `HEALTHCHECK_API_KEY` (`hcw_...`) is your account key for the REST API
   - The agent pings the URL after every successful run — no ping = alert

---

## Run

```bash
npm start
```

You will see an interactive menu. Press `Ctrl+C` at any time to exit safely.

---

## How it works

| Step | What happens            | Fails when...                          |
|------|-------------------------|----------------------------------------|
| 1    | Check schedule window   | Run outside 9:00–9:05 Warsaw time      |
| 2    | Acquire lock            | Another instance is already running    |
| 3    | Validate input          | `news.json` is older than 24h or empty |
| 4    | Call OpenRouter         | API error or timeout                   |
| 5    | Validate output         | Response is not valid JSON or too short |
| 6    | Send heartbeat ping     | Network error or non-200 response      |
| 7    | Release lock            | Always runs (finally block)            |

---

## Menu options

| Option | What it does                                  | What it demonstrates              |
|--------|-----------------------------------------------|-----------------------------------|
| 1      | Runs cron every 1 minute on clean data        | Happy path — all 6 checks pass    |
| 2      | Uses input data timestamped 26h in the past   | Input validation alert            |
| 3      | Returns malformed AI output (too short)       | Output validation alert           |
| 4      | Sends heartbeat to an unreachable URL         | Heartbeat failure alert           |
| 5      | Holds the lock then tries to run the agent    | Lock conflict alert               |
| 6      | Exits cleanly                                 | —                                 |

---

## File structure

```
src/
  prompts/digest.md       <- edit the AI prompt here
  schemas/index.ts        <- zod schemas for input and output
  services/agent.ts       <- main logic, connects everything
  services/openrouter.ts  <- OpenRouter API call with retry
  services/lock.ts        <- lock file (acquire / release)
  services/heartbeat.ts   <- ping to healthchecks.io
  utils/alert.ts          <- alert on fail (console + Slack)
  utils/logger.ts         <- log file writer with buffer mode
  index.ts                <- CLI menu entry point
data/news.json            <- input data (with timestamp)
workspace/results/        <- output with timestamp per run
logs/                     <- auto-generated daily log files
config.json               <- all config values (model, limits, paths)
.env                      <- API keys (never commit!)
```

---

## Configuration

All tuneable values live in `config.json` — no code changes needed:

```json
{
  "timezone": "Europe/Warsaw",
  "scheduleHour": 9,
  "scheduleWindowMinutes": 5,
  "maxInputAgeHours": 24,
  "minOutputLength": 100,
  "lockFilePath": ".agent.lock",
  "lockTtlMinutes": 30,
  "model": "google/gemini-2.0-flash-001",
  "cronIntervalMinutes": 1
}
```

To swap the AI model, change `model`. To adjust the cron interval, change `cronIntervalMinutes`.
