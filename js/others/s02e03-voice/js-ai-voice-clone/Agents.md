# Agents.md — Voice Clone Warning Demo

## Co robi ten projekt?

Demonstruje syntezę mowy przy użyciu głosów dostępnych na koncie ElevenLabs.

Cel: edukacja o możliwościach i zagrożeniach związanych z AI TTS (s02e03).

---

## Jak to działa?

```
Uruchamiasz aplikację
        │
        ▼
ElevenLabs → pobiera listę dostępnych głosów
        │
        ▼
Wybierasz głos z listy (numer)
        │
        ▼
Wpisujesz tekst w konsoli
        │
        ▼
ElevenLabs → syntezuje mowę wybranym głosem
        │
        ▼
Plik .mp3 zapisany lokalnie
        │
        ▼
Raport: czas operacji
```

---

## Stack

| Element | Technologia |
|---|---|
| Język | TypeScript (strict mode) |
| Synteza mowy | ElevenLabs API |
| Interaktywne menu | stdin (readline — wbudowane w Node) |
| Wyjście | plik `.mp3` |

---

## Struktura projektu

```
js-ai-voice-clone/
├── src/
│   ├── elevenlabs.ts     ← wywołania API (list voices, tts)
│   ├── logger.ts         ← logger z poziomami INFO/WARN/ERROR
│   └── index.ts          ← CLI: wybór głosu → tekst → audio
├── logs/                 ← logi aplikacji
├── results/              ← wygenerowane pliki .mp3
├── config.json           ← konfiguracja (model, format, itp.)
├── .env                  ← ELEVENLABS_API_KEY
├── .env.example          ← szablon .env
└── Readme.md             ← dokumentacja (EN)
```

---

## Zmienne środowiskowe (`.env`)

| Zmienna | Opis |
|---|---|
| `ELEVENLABS_API_KEY` | Klucz API z elevenlabs.io |

---

## Konfiguracja (`config.json`)

| Klucz | Opis | Przykład |
|---|---|---|
| `model_id` | Model TTS ElevenLabs | `"eleven_multilingual_v2"` |
| `output_format` | Format pliku wyjściowego | `"mp3_44100_128"` |
| `stability` | Stabilność głosu (0–1) | `0.5` |
| `similarity_boost` | Podobieństwo do oryginału (0–1) | `0.75` |
| `voice_id` | Domyślny głos (nieużywany — wybór interaktywny) | `"21m00Tcm4TlvDq8ikWAM"` |

---

## Zadania do wykonania

- [x] Inicjalizacja projektu (`package.json`, `tsconfig.json`)
- [x] Konfiguracja `.env` i `config.json`
- [x] `src/logger.ts` — logger z poziomami INFO/WARN/ERROR
- [x] `src/elevenlabs.ts` — listowanie głosów, TTS
- [x] `src/index.ts` — interaktywny wybór głosu + synteza + zapis
- [x] `Readme.md` — dokumentacja w języku angielskim

---

## Raport końcowy (przykład)

```
Done. File saved: results/output_2026-06-02_143021.mp3
Elapsed: 3.2s
```

---

## Zasady

> Używaj wyłącznie **własnego głosu**. Projekt służy wyłącznie celom edukacyjnym.
