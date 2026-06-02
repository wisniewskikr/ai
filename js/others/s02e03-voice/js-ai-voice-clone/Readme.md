# js-ai-voice-clone

Educational demo showing that 30 seconds of your voice is enough for AI to create a clone of it.

> **For educational purposes only. Use your own voice.**

## What it does

1. Reads an audio file from `workspace/`
2. Validates format and minimum duration (30s)
3. Clones the voice via ElevenLabs API
4. Prompts you to enter text
5. Synthesizes speech using the cloned voice
6. Saves the result as `.mp3` in `results/`
7. Deletes the voice clone from ElevenLabs (auto-cleanup)
8. Prints a report with elapsed time and a warning

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

1. Place a 30+ second audio file (mp3/wav/m4a) in `workspace/`
2. Run:

```bash
npm start
```

3. Type the text you want synthesized when prompted
4. Find the output in `results/`

## File Structure

```
js-ai-voice-clone/
├── src/
│   ├── elevenlabs.ts   - ElevenLabs API calls (clone, TTS, delete)
│   ├── logger.ts       - Logger with INFO/WARN/ERROR levels
│   └── index.ts        - CLI entry point
├── logs/               - Application logs
├── workspace/          - Input audio files (place your recording here)
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
| `min_audio_duration_sec` | Minimum input audio duration | `30` |
| `supported_formats` | Accepted audio formats | `["mp3","wav","m4a"]` |
