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
Walidacja pliku (format, długość)
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
        │
        ▼
ElevenLabs → usuwa klon głosu z konta (auto-cleanup)
        │
        ▼
Raport: czas operacji + ostrzeżenie edukacyjne
```

---

## Stack

| Element | Technologia |
|---|---|
| Język | TypeScript (strict mode) |
| Klonowanie głosu | ElevenLabs API |
| Synteza mowy | ElevenLabs API |
| Wejście tekstu | stdin (readline — wbudowane w Node) |
| Wyjście | plik `.mp3` |

---

## Struktura projektu

```
js-ai-voice-clone/
├── src/
│   ├── elevenlabs.ts     ← wszystkie wywołania API (clone, tts, delete)
│   ├── logger.ts         ← logger z poziomami INFO/WARN/ERROR
│   └── index.ts          ← CLI: wejście → klon → tekst → audio → cleanup
├── logs/                 ← logi aplikacji
├── workspace/            ← pliki audio wejściowe
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
| `min_audio_duration_sec` | Minimalna długość nagrania wejściowego | `30` |
| `supported_formats` | Obsługiwane formaty audio | `["mp3", "wav", "m4a"]` |

---

## Zadania do wykonania

- [ ] Inicjalizacja projektu (`package.json`, `tsconfig.json`)
- [ ] Konfiguracja `.env` i `config.json`
- [ ] `src/logger.ts` — logger z poziomami INFO/WARN/ERROR
- [ ] `src/elevenlabs.ts` — klonowanie głosu, TTS, usuwanie klonu
- [ ] `src/index.ts` — główny skrypt CLI + walidacja audio + raport końcowy
- [ ] `Readme.md` — dokumentacja w języku angielskim

---

## Raport końcowy (przykład)

```
✅ Gotowe. Plik zapisany: results/output_2026-06-02_143021.mp3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  OSTRZEŻENIE
   Twój głos został sklonowany w 8.3 sekundy
   Na podstawie tylko 30s nagrania
   Klon usunięty z ElevenLabs ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Zasady

> Używaj wyłącznie **własnego głosu**. Projekt służy wyłącznie celom edukacyjnym.
