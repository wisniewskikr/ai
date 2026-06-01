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
| Przycinanie do 30s | `fluent-ffmpeg` |
| Lokalny STT | `faster-whisper` (Python) |
| Wynik | plik `.txt` w `workspace/` |

---

## Wymagania wstępne

- Python >= 3.8 z zainstalowanym `faster-whisper` (`pip install faster-whisper`)
- Zainstalowane `ffmpeg` (dostępne w PATH)
- Node.js >= 18

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
