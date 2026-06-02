# Agents.md — Voice Clone Warning Demo

## Co robi ten projekt?

Pokazuje, że **30 sekund Twojego głosu wystarczy**, żeby AI stworzyła jego kopię.

Cel: edukacja o zagrożeniach związanych z klonowaniem głosu (s02e03).

---

## Jak to działa?

```
Twój plik audio (30s)
        │
        ▼
ElevenLabs → tworzy klon głosu
        │
        ▼
Wpisujesz tekst w konsoli
        │
        ▼
ElevenLabs → syntezuje mowę Twoim głosem
        │
        ▼
Plik .mp3 zapisany lokalnie
```

---

## Stack

| Element | Technologia |
|---|---|
| Język | TypeScript (strict mode) |
| Klonowanie głosu | ElevenLabs API |
| Synteza mowy | ElevenLabs API |
| Wejście tekstu | stdin (konsola) |
| Wyjście | plik `.mp3` |

---

## Struktura projektu

```
js-ai-voice-clone/
├── src/
│   ├── services/
│   │   └── elevenlabs.ts     ← klonowanie głosu + synteza
│   └── utils/
│       ├── logger.ts         ← logowanie do pliku
│       └── input.ts          ← czytanie tekstu z konsoli
├── logs/                     ← logi aplikacji
├── workspace/                ← pliki audio wejściowe
├── results/                  ← wygenerowane pliki .mp3
├── config.json               ← konfiguracja (model, format, itp.)
├── .env                      ← ELEVENLABS_API_KEY
├── .env.example              ← szablon .env
└── Readme.md                 ← dokumentacja (EN)
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

---

## Zadania do wykonania

- [ ] Inicjalizacja projektu (`package.json`, `tsconfig.json`)
- [ ] Konfiguracja `.env` i `config.json`
- [ ] `src/utils/logger.ts` — logger z poziomami INFO/WARN/ERROR
- [ ] `src/utils/input.ts` — czytanie tekstu z konsoli (stdin)
- [ ] `src/services/elevenlabs.ts` — klonowanie głosu + TTS
- [ ] `src/index.ts` — główny skrypt (CLI)
- [ ] `Readme.md` — dokumentacja w języku angielskim

---

## Zasady

> Używaj wyłącznie **własnego głosu**. Projekt służy wyłącznie celom edukacyjnym.
