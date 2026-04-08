# AI Chat App — Ustalenia

## Architektura

**Prosta pętla konwersacyjna** — bez workflow, agentów ani multi-agentów.

```
[user input] → [dodaj do history] → [wyślij do API] → [dodaj odpowiedź do history] → [wyświetl] → repeat
```

### Kluczowe elementy
- **Historia wiadomości** — tablica `{ role, content }[]` przekazywana przy każdym wywołaniu API
- **Pętla REPL** — czytaj input, wywołaj API, wypisz odpowiedź
- **Config** — `config.json` z modelem i parametrami

### Kiedy przejść do agenta?
Dopiero gdy AI potrzebuje wykonywać akcje: szukać w sieci, czytać pliki, wywoływać zewnętrzne API.

---

## Model

**Domyślny (development):** `meta-llama/llama-3.1-8b-instruct:free`
- Darmowy, wystarczająca jakość do czatu
- Limit ~20 req/min

**Alternatywy produkcyjne:**
| Model | Cena |
|---|---|
| `google/gemini-2.0-flash-lite` | ~$0.075/1M tokenów |
| `mistralai/mistral-7b-instruct` | ~$0.055/1M tokenów |

Zmiana modelu = jedna linia w `config.json`.

---

## Stack

- **Język:** TypeScript
- **API:** OpenRouter (`https://openrouter.ai/api/v1`)
- **Konfiguracja:** `config.json`

---

## Funkcjonalności

### Komenda wyjścia
- Użytkownik wpisuje słowo kluczowe (domyślnie `exit`) aby zakończyć działanie
- Komenda i komunikat powitalny są konfigurowalne w `config.json`:
  ```json
  {
    "exitCommand": "exit",
    "exitMessage": "Type 'exit' to quit the chatbot."
  }
  ```

### Historia konwersacji
- Komenda `/history` wyświetla sformatowaną historię w trakcie trwania sesji

### Logowanie do plików
- Logi zapisywane w folderze `logs/YYYY-MM-DD.log`
- Każdy wpis ma timestamp i poziom (`INFO`, `ERROR`, `USER`, `ASSISTANT`)
- Kolorowe wyjście w konsoli (`INFO` = cyan, `ERROR` = czerwony)
- Logowane zdarzenia: start/koniec sesji, każda wiadomość, błędy API

---

## Styl kodu

**Wzorzec: Linus Torvalds**
- Brak zbędnych abstrakcji — każda warstwa istnieje z powodu
- Małe funkcje robiące jedną rzecz
- Jasne nazwy zmiennych i funkcji
- Komentarze tłumaczą *dlaczego*, nie *co*
- Bezpośrednia obsługa błędów — żadnego ukrywania
- Zero over-engineeringu

## Struktura projektu

```
js-ai-chat/
├── src/
│   ├── index.ts      # punkt wejścia
│   ├── chat.ts       # pętla REPL, historia, interfejsy Message/Config
│   ├── api.ts        # wywołania OpenRouter
│   ├── logger.ts     # logowanie do pliku i konsoli
│   └── config.ts     # ładowanie konfiguracji i interfejs Config
├── logs/             # pliki logów (gitignored)
├── config.json       # konfiguracja
├── .env.example      # szablon zmiennych środowiskowych
├── .gitignore        # ignoruje: logs/, .env, dist/, node_modules/
├── package.json
├── tsconfig.json
└── README.md         # po angielsku
```

> `types.ts` nie istnieje — interfejsy `Message` i `Config` żyją w plikach, które ich używają.

### API Key
Przekazywany przez zmienną środowiskową `OPENROUTER_API_KEY` (nie w `config.json`). Szablon w `.env.example`.

---

## Kolejność implementacji

```
1. package.json + tsconfig.json          ← środowisko
2. config.ts + config.json               ← wczytaj config, waliduj API key
3. logger.ts                             ← logi od razu, żeby debugować resztę
4. api.ts                                ← jeden fetch do OpenRouter
5. chat.ts (pętla bez /history)          ← działający czat
6. chat.ts (dodaj /history)              ← dopiero teraz feature
7. README.md + .gitignore + .env.example ← dokumentacja na końcu
```

### Kluczowa decyzja techniczna
`node:readline/promises` (Node 18+) zamiast callback-based readline — eliminuje callback hell w pętli REPL.
