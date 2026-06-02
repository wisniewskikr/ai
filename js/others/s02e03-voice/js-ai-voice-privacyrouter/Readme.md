# JS AI Voice Privacy Router

Routes audio files between cloud and local processing based on content sensitivity.

Each audio file is transcribed locally with Whisper, then a local LLM classifies the transcript. The result is either **CLOUD** (safe to send to external APIs) or **LOCAL** (must stay on your machine).

## How it works

```
audio file → Whisper (local) → transcript → LM Studio (local) → CLOUD | LOCAL
```

## Requirements

- Node.js 18+
- [LM Studio](https://lmstudio.ai/) running on `localhost:1234` with model `qwen3-4b-alpaca-chatwithme` loaded

## Installation

```bash
npm install
```

First run will download the Whisper model (~150 MB) automatically.

## Usage

Drop audio files (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`) into the `workspace/` folder, then run:

```bash
# Development
npm run dev

# Production (compile first)
npm run build
npm start
```

## Output

Terminal table with per-file routing decision:

```
File                            Topic                 Sensitivity  Decision
------------------------------------------------------------------------
shoppling-list.mp3              Grocery shopping      low          CLOUD
meeting-roche.mp3               Business meeting      high         LOCAL
reaserach-results.mp3           Medical results       high         LOCAL

Privacy routing complete. Report: results/routing-report.json
```

Full report saved to `results/routing-report.json`.

## Project structure

```
js-ai-voice-privacyrouter/
├── src/
│   ├── prompts/classify.ts     ← LLM classification prompt
│   ├── services/
│   │   ├── transcriber.ts      ← Whisper transcription
│   │   └── classifier.ts       ← LLM classification
│   └── utils/
│       ├── logger.ts           ← file + console logging
│       └── audioScanner.ts     ← scan workspace/ for audio
├── logs/                       ← log files (gitignored)
├── results/                    ← routing report (gitignored)
├── workspace/                  ← put audio files here (gitignored)
├── config.json                 ← all config variables
├── .env                        ← API keys (never commit)
└── index.ts                    ← entry point
```

## Configuration

Edit `config.json` to change the LLM endpoint, model, or Whisper model:

```json
{
  "llm": {
    "baseUrl": "http://localhost:1234/v1",
    "model": "qwen3-4b-alpaca-chatwithme"
  },
  "whisper": {
    "model": "Xenova/whisper-tiny"
  }
}
```

## Privacy guarantee

- Audio files never leave your machine
- Transcription is done locally (no cloud API)
- Classification is done locally (LM Studio, no cloud API)
- Only files classified as CLOUD would be sent to external services (not implemented here — routing decision only)
