# AGENTS.md — js-ai-voice-localstt

## Co to robi?

Podajesz link do YouTube → program pobiera pierwsze 30 sekund → zamienia dźwięk na tekst → zapisuje plik w folderze `workspace/`.

Jak poczta: dostajesz paczkę (audio), otwierasz ją (transkrypcja), odkładasz na półkę (`workspace/`).

---

## Stack

| Warstwa | Narzędzie |
|---|---|
| Język | TypeScript + `tsx` |
| Pobieranie audio | `yt-dlp-exec` |
| Przycinanie do 30s | `fluent-ffmpeg` + `ffmpeg` (zewnętrzny) |
| Lokalny STT | `faster-whisper` (Python) |
| Wynik | plik `.txt` w `workspace/` |
| Konfiguracja | `config.json` (m.in. `ffmpegPath`, `audioDurationSeconds`) |

---

## Wymagania wstępne

- Python >= 3.8 z zainstalowanym `faster-whisper` (`pip install faster-whisper`)
- Zainstalowane `ffmpeg` — na Windows instalacja przez `winget install Gyan.FFmpeg`, następnie ścieżka do `ffmpeg.exe` w `config.json` pod kluczem `ffmpegPath`
- Node.js >= 18 dostępny w PATH (na Windows może wymagać ręcznego uruchomienia: `node node_modules/tsx/dist/cli.mjs src/index.ts`)

> **Uwaga:** LMStudio z modelami Whisper nie działa na Windows (MLX działa tylko na macOS/Apple Silicon).

---

## Struktura projektu

```
src/
  index.ts      ← start, pyta o URL, pokazuje wynik
  youtube.ts    ← pobiera audio z YouTube i przycina do 30s
  stt.ts        ← wywołuje faster-whisper (Python), zwraca tekst
workspace/      ← tu lądują pliki z transkrypcjami
package.json
.env
```

---

## Przepływ

```
1. Użytkownik podaje URL YouTube (w konsoli)
2. yt-dlp pobiera audio
3. ffmpeg przycina do 30 sekund
4. Audio trafia do faster-whisper (wywołanie Python przez child_process)
5. Tekst zapisywany do workspace/<timestamp>.txt
6. Konsola pokazuje ścieżkę do pliku
```

---

## Konfiguracja (config.json)

```json
{
  "whisperModel": "base",
  "audioDurationSeconds": 30,
  "workspaceDir": "workspace",
  "logsDir": "logs",
  "ffmpegPath": ""
}
```

| Klucz | Domyślna wartość | Opis |
|---|---|---|
| `whisperModel` | `base` | Rozmiar modelu Whisper (`tiny`, `base`, `small`, `medium`, `large-v3`) |
| `audioDurationSeconds` | `30` | Ile sekund audio transkrybować |
| `workspaceDir` | `workspace` | Folder na pliki `.txt` |
| `logsDir` | `logs` | Folder na logi |
| `ffmpegPath` | `""` | Pełna ścieżka do `ffmpeg.exe` — wymagane na Windows jeśli ffmpeg nie jest w PATH |

---

## Zmienne środowiskowe (.env)

| Zmienna | Domyślna wartość | Opis |
|---|---|---|
| `WHISPER_MODEL` | `base` | Rozmiar modelu Whisper (`tiny`, `base`, `small`, `medium`, `large-v3`) |

---

## Uruchomienie

```bash
npm install
npm start
```

Konsola zapyta:

```
Podaj URL YouTube:
```

Po zakończeniu:

```
Transkrypcja zapisana: workspace/2026-05-11T10-30-00.txt
```
