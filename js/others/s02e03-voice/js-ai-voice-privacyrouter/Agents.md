# Privacy Router — Agents.md

## Co to robi?

Wyobraź sobie strażnika przy bramce na lotnisku.
Każdy plik audio przechodzi przez bramkę — strażnik decyduje: *"Wchodzisz do chmury"* albo *"Zostajesz na miejscu"*.

**Skrypt:**
1. Skanuje folder `workspace/` — szuka plików audio
2. Wysyła nazwę pliku do LLM — pyta: *"Czy to wrażliwe?"*
3. Dostaje odpowiedź w JSON
4. Wypisuje decyzję: **CLOUD** albo **LOCAL**

---

## Model

| | Szczegół |
|---|---|
| **Provider** | OpenRouter |
| **Model** | `openai/gpt-4o-mini` |
| **Dlaczego?** | Tani, szybki, świetny do klasyfikacji |
| **Alternatywa (darmowa)** | `meta-llama/llama-3.1-8b-instruct:free` |

---

## Struktura projektu

```
js-ai-voice-privacyrouter/
├── .env              # OPENROUTER_API_KEY
├── package.json
├── index.js          # glowny skrypt
└── workspace/        # tu wrzucasz pliki audio (gitignored)
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

- Nie transkrybuje audio (to zadanie dla Whisper)
- Nie nagrywa dzwieku
- Nie wysyla pliku audio do chmury — tylko nazwe pliku do klasyfikacji

---

## Konfiguracja

`.env`:
```
OPENROUTER_API_KEY=sk-or-...
```
