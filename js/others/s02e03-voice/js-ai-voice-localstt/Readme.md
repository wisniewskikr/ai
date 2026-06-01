# js-ai-voice-localstt

YouTube URL → first 30 seconds of audio → local transcription via faster-whisper → `.txt` file in `workspace/`.

## Requirements

- Node.js >= 18
- Python >= 3.8 with `faster-whisper` installed:
  ```bash
  pip install faster-whisper
  ```
- `ffmpeg` installed (see [Windows note](#windows-notes))

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

```json
{
  "whisperModel": "base",
  "audioDurationSeconds": 30,
  "workspaceDir": "workspace",
  "logsDir": "logs",
  "ffmpegPath": ""
}
```

| Key | Default | Description |
|---|---|---|
| `whisperModel` | `base` | Whisper model size (`tiny`, `base`, `small`, `medium`, `large-v3`) |
| `audioDurationSeconds` | `30` | How many seconds of audio to transcribe |
| `workspaceDir` | `workspace` | Output directory for `.txt` transcriptions |
| `logsDir` | `logs` | Directory for log files |
| `ffmpegPath` | `""` | Absolute path to `ffmpeg.exe` — required on Windows if ffmpeg is not in system PATH |

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

## Windows Notes

- Install ffmpeg via winget:
  ```
  winget install Gyan.FFmpeg
  ```
  Then set `ffmpegPath` in `config.json` to the full path of `ffmpeg.exe`, e.g.:
  ```json
  "ffmpegPath": "C:\\Users\\<user>\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe"
  ```
- If Node.js is not in the system PATH (e.g. installed to `C:\Development\nodejs`), run the app directly instead of `npm start`:
  ```
  node node_modules/tsx/dist/cli.mjs src/index.ts
  ```

## Notes

- LMStudio Whisper models (MLX) work only on macOS/Apple Silicon — this project uses `faster-whisper` which runs on CPU/Windows.
- Audio is downloaded to the system temp directory and cleaned up after transcription.

## Tools

| Tool | Role |
|---|---|
| `yt-dlp` | Downloads audio from YouTube |
| `ffmpeg` | Trims audio to the configured duration |
| `faster-whisper` | Transcription — runs locally on CPU |
