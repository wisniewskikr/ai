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
| Lokalny STT | LMStudio Whisper API |
| Wynik | plik `.txt` w `workspace/` |

---

## Wymagania wstępne

- LMStudio uruchomione lokalnie na `http://localhost:1234`
- Załadowany model Whisper (np. `whisper-large-v3`)
- Zainstalowane `ffmpeg` (dostępne w PATH)
- Node.js >= 18

---

## Struktura projektu

```
src/
  index.ts      ← start, pyta o URL, pokazuje wynik
  youtube.ts    ← pobiera audio z YouTube i przycina do 30s
  stt.ts        ← wysyła audio do LMStudio, zwraca tekst
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
4. Audio trafia do LMStudio /v1/audio/transcriptions
5. Tekst zapisywany do workspace/<timestamp>.txt
6. Konsola pokazuje ścieżkę do pliku
```

---

## Zmienne środowiskowe (.env)

| Zmienna | Domyślna wartość | Opis |
|---|---|---|
| `LMSTUDIO_BASE_URL` | `http://localhost:1234` | Adres lokalnego LMStudio |
| `WHISPER_MODEL` | `whisper-large-v3` | Nazwa modelu Whisper w LMStudio |

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
