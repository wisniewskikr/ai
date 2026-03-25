# js-ai-openrouter-media-audio

Audio transcription, analysis, and text-to-speech with Gemini plus MCP file tools.

## Run

```bash
npm start
```

## Required setup

1. Copy `.env.example` to `.env` in this folder.
2. Set `OPENROUTER_API_KEY` for LLM orchestration.
3. Set `GEMINI_API_KEY` for audio understanding and TTS.
4. Put source files in `workspace/input/` when working with local audio.

## What it does

### Audio → Text (analysis)

- **Transcribe** audio to text with speaker labels, timestamps, emotion detection, and optional translation
- **Analyze** audio content — music genre/tempo/instruments, speech patterns, sound identification
- **Query** audio with any custom question ("What topics are discussed?", "How many speakers?")

Supported input sources:
- Local files in `workspace/input/` — MP3, WAV, AIFF, AAC, OGG, FLAC
- YouTube URLs directly

### Text → Audio (generation)

- **Generate speech** (TTS) from text using 30 different Gemini voices (Kore, Puck, Aoede, etc.)
- Style control via natural language: `"Say cheerfully: Hello!"`
- Multi-speaker dialogue support (up to 2 voices)
- Output saved as WAV files to `workspace/output/`

## Example prompts

```
Transcribe workspace/input/audio.mp3
Analyze the music in workspace/input/song.mp3
What topics are discussed in this recording?
Generate audio: Welcome to our demo
Translate this recording to Spanish
```

## Notes

Use `clear` to reset the conversation and `exit` to quit the REPL.
