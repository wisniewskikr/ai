# Privacy Router — Agents.md

## Co to robi?

Wyobraź sobie strażnika przy bramce na lotnisku.
Każdy plik audio przechodzi przez bramkę — strażnik decyduje: *"Wchodzisz do chmury"* albo *"Zostajesz na miejscu"*.

**Skrypt:**
1. Skanuje folder `workspace/` — szuka plików audio
2. Transkrybuje audio lokalnie (Whisper)
3. Wysyla transkrypt do LLM — pyta: *"Czy to wrazliwe?"*
4. Dostaje odpowiedz w JSON
5. Wypisuje decyzje: **CLOUD** albo **LOCAL**

---

## Tryb LOCAL (Whisper + LM Studio)

Jak sejf w domu — wszystko zostaje u Ciebie, nikt z zewnatrz nie ma dostepu.

```
plik audio → Whisper lokalny (transkrypt) → LM Studio (localhost:1234) → klasyfikacja
```

| | Szczegol |
|---|---|
| **Transkrypcja** | `@xenova/transformers` + model `whisper-tiny` (~150 MB) |
| **Klasyfikacja** | LM Studio — `qwen3-4b-alpaca-chatwithme` |
| **API** | `http://localhost:1234/v1` — kompatybilne z OpenAI |
| **Prywatnosc** | Wysoka — nic nie opuszcza komputera |

> **Dlaczego `@xenova/transformers`?** Czysty JavaScript — bez Pythona, dziala w Node.js od razu.
> `nodejs-whisper` wymaga Pythona i jest bolesny w instalacji na Windows.

> **Dlaczego `whisper-tiny`?** Do klasyfikacji tematu dokladnosc nie musi byc idealna.
> Chodzi o rozroznienie "zakupy" od "dane pacjenta" — `tiny` jest 3x szybszy od `base`.

> **Uwaga — Qwen3 i tryb myslenia:** Qwen3 domyslnie zwraca blok `<think>...</think>` przed odpowiedzia.
> Wylacz go w system prompcie: `/no_think` — krotszy kod, pewniejszy JSON.
> Alternatywa: odciecie w kodzie:
> ```js
> const clean = response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
> const result = JSON.parse(clean);
> ```

---

## Struktura projektu

```
js-ai-voice-privacyrouter/
├── .env                        # OPENROUTER_API_KEY
├── package.json
├── index.js                    # glowny skrypt
├── workspace/                  # tu wrzucasz pliki audio (gitignored)
└── results/
    └── routing-report.json     # wyniki klasyfikacji (gitignored)
```

---

## Zasada routingu

Jedna prosta regula z README-security-pl.md:

> Czy wyslalbys tresc nagrania mailem do obcego czlowieka?
> - NIE → LOCAL (zostaje na komputerze)
> - TAK → CLOUD (mozna wyslac do API)

| Przyklad pliku | Temat | Decyzja |
|----------------|-------|---------|
| `lista-zakupow.mp3` | Zakupy | CLOUD |
| `notatka-webinar.wav` | Publiczne | CLOUD |
| `spotkanie-klient-xyz.mp3` | Biznes/klient | LOCAL |
| `wyniki-badan.m4a` | Medyczne | LOCAL |
| `faktury-q3.wav` | Finansowe | LOCAL |

---

## Przyklad odpowiedzi LLM (JSON)

```json
{
  "topic": "spotkanie z klientem",
  "sensitivity": "high",
  "decision": "local",
  "reason": "Dane biznesowe — nie wysylac do chmury"
}
```

---

## Przyklad outputu w terminalu

```
Analizuje 3 pliki z workspace/

Plik                          Temat             Wrazliwosc  Decyzja
----------------------------------------------------------------------
lista-zakupow.mp3             Zakupy codzienne  niska       CLOUD
spotkanie-klient-xyz.mp3      Klient/biznes     wysoka      LOCAL
wyniki-badan.wav              Medyczne          wysoka      LOCAL

Routing prywatnosci zakonczony.
```

---

## Czego NIE robi ten skrypt

- Nie nagrywa dzwieku
- Nie wysyla pliku audio do chmury
- Nie transkrybuje na produkcyjna jakosc — `whisper-tiny` sluzy tylko do klasyfikacji tematu

---

## Konfiguracja

`.env`:
```
OPENROUTER_API_KEY=sk-or-...
```

Uruchomienie:
```bash
node index.js
```

Wymagania:
- LM Studio uruchomione na `localhost:1234`
- Zaladowany model `qwen3-4b-alpaca-chatwithme`

Instalacja zaleznosci:
```bash
npm install @xenova/transformers openai
```
