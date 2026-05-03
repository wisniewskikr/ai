# js-ai-access-dryrun

AI-powered file organizer demonstrating **Dry Run Mode** and **Human-in-the-Loop** access control principles.

The agent always shows its plan and waits for explicit confirmation before touching any files.

## How it works

```
1. Scan     workspace/ → list of files
2. Plan     LLM receives the list → returns a JSON plan of MOVE operations
3. Preview  CLI displays the plan in a human-readable format
4. Confirm  User is asked: "Czy kontynuowac? [tak/nie]"
5a. TAK     Files are moved + every action is written to logs/audit.log
5b. NIE     Nothing happens — clean exit
```

## Security principles demonstrated

| Principle | Implementation |
|-----------|---------------|
| **Dry Run Mode** | Full plan is shown before any action is taken |
| **Human in the Loop** | Explicit `[tak/nie]` confirmation required |
| **Audit Trail** | Every operation logged to `logs/audit.log` with timestamp |
| **Least Privilege** | Agent only reads filenames and moves files — nothing else |

## Requirements

- Node.js 18+
- OpenRouter API key

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and add your key:

```bash
cp .env.example .env
```

## Usage

```bash
npm start
```

Add files to the `workspace/` directory before running. The agent will scan, plan, and ask for confirmation.

### Example output

```
Skanowanie workspace/...
Znaleziono 7 plikow. Tworzenie planu...

Zamierzam wykonac 7 operacji:

  [MOVE] faktura_2024_01.pdf              →  faktury/faktura_2024_01.pdf
  [MOVE] kot_wakacje.jpg                  →  zdjecia/kot_wakacje.jpg
  [MOVE] umowa_najmu.docx                 →  dokumenty/umowa_najmu.docx

Czy kontynuowac? [tak/nie]: tak

[OK] faktura_2024_01.pdf → faktury/faktura_2024_01.pdf
[OK] kot_wakacje.jpg → zdjecia/kot_wakacje.jpg
[OK] umowa_najmu.docx → dokumenty/umowa_najmu.docx

Zapisano do logs/audit.log
```

## Project structure

```
js-ai-access-dryrun/
├── src/
│   ├── prompts/
│   │   └── planner.ts      # LLM system prompt (edit without touching logic)
│   ├── services/
│   │   ├── scanner.ts      # Reads file list from workspace/
│   │   ├── planner.ts      # Calls LLM, returns structured plan
│   │   └── executor.ts     # Moves files, writes audit log
│   ├── utils/
│   │   ├── logger.ts       # File logger [YYYY-MM-DD HH:mm:ss] [LEVEL]
│   │   └── cli.ts          # readline confirmation prompt
│   └── index.ts            # Main entry point
├── workspace/              # Files to organize (gitignored)
├── logs/                   # audit.log (gitignored)
├── config.json             # Model, paths, limits
├── .env                    # OPENROUTER_API_KEY (never commit)
├── .env.example            # Template
└── Readme.md
```

## Configuration

All tunable settings are in `config.json`:

| Key | Default | Description |
|-----|---------|-------------|
| `model` | `openai/gpt-4o-mini` | OpenRouter model to use |
| `workspaceDir` | `workspace` | Directory to scan |
| `auditLogFile` | `logs/audit.log` | Audit log path |
| `maxFilesPerPlan` | `50` | Max files per single plan |
