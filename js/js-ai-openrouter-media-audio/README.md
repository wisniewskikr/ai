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

1. Reads files from `workspace/input/` through `files-mcp`
2. Transcribes or analyzes audio with Gemini
3. Generates speech to `workspace/output/` when asked
4. Supports both local files and YouTube URLs

## Notes

Use `clear` to reset the conversation and `exit` to quit the REPL.
