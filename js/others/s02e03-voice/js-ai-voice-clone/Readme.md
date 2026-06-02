# js-ai-voice-clone

Educational demo of AI text-to-speech synthesis using ElevenLabs voices.

> **For educational purposes only.**

## What it does

1. Fetches available voices from your ElevenLabs account
2. Lets you pick a voice interactively
3. Prompts you to enter text
4. Synthesizes speech using the selected voice
5. Saves the result as `.mp3` in `results/`

## Requirements

- Node.js >= 18
- [ElevenLabs](https://elevenlabs.io) account and API key

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your API key:

```bash
cp .env.example .env
```

## Usage

```bash
npm start
```

1. Select a voice from the interactive list
2. Type the text you want synthesized
3. Find the output in `results/`

## File Structure

```
js-ai-voice-clone/
├── src/
│   ├── elevenlabs.ts   - ElevenLabs API calls (list voices, TTS)
│   ├── logger.ts       - Logger with INFO/WARN/ERROR levels
│   └── index.ts        - CLI entry point
├── logs/               - Application logs
├── results/            - Generated .mp3 files
├── config.json         - Configuration (model, format, thresholds)
├── .env                - API key (never commit)
└── .env.example        - Environment variable template
```

## Configuration (`config.json`)

| Key | Description | Default |
|-----|-------------|---------|
| `model_id` | ElevenLabs TTS model | `eleven_multilingual_v2` |
| `output_format` | Output file format | `mp3_44100_128` |
| `stability` | Voice stability (0-1) | `0.5` |
| `similarity_boost` | Similarity to original (0-1) | `0.75` |
