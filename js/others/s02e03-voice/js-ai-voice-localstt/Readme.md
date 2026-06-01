# js-ai-voice-localstt

YouTube URL → first 30 seconds of audio → local transcription via faster-whisper → `.txt` file in `workspace/`.

## Requirements

- Node.js >= 18
- Python >= 3.8 with `faster-whisper` installed:
  ```bash
  pip install faster-whisper
  ```
- `ffmpeg` installed and available in PATH

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

The console will prompt:

```
Podaj URL YouTube:
```

After completion:

```
[2026-06-01 10:30:00] [INFO] Transkrypcja zapisana: workspace/2026-06-01T10-30-00-000Z.txt
```

## Configuration

Edit `config.json` to change runtime settings:

| Key | Default | Description |
|---|---|---|
| `whisperModel` | `base` | Whisper model size (`tiny`, `base`, `small`, `medium`, `large-v3`) |
| `audioDurationSeconds` | `30` | How many seconds of audio to transcribe |
| `workspaceDir` | `workspace` | Output directory for `.txt` transcriptions |
| `logsDir` | `logs` | Directory for log files |

Override the Whisper model at runtime via `.env`:

```
WHISPER_MODEL=small
```

## Project Structure

```
src/
  index.ts                  ← entry point, prompts for URL, saves result
  whisper_transcribe.py     ← Python script called by faster-whisper
  services/
    youtube.ts              ← downloads audio from YouTube, trims to N seconds
    stt.ts                  ← calls whisper_transcribe.py via child_process
  utils/
    logger.ts               ← logs to console and logs/ directory
config.json                 ← all configuration variables
workspace/                  ← transcription output files
logs/                       ← application logs
```

## Notes

- LMStudio Whisper models (MLX) work only on macOS/Apple Silicon — this project uses `faster-whisper` which runs on CPU/Windows.
- Audio is downloaded to the system temp directory and cleaned up after transcription.
