# Etyczny Scraper — Ustalenia projektu

## Co budujemy?

Demo w TypeScript pokazujące, jak **scraper może zachowywać się grzecznie** — jak gość, który dzwoni przed wizytą, przedstawia się i nie niszczy mebli.

> Cała komunikacja z uzytkownikiem (menu, komunikaty, logi) jest w **jezyku angielskim**.

---

## Zasady (z `Readme-security-pl.md` → sekcja Scraping)

| # | Zasada | Jak to robimy |
|---|--------|---------------|
| 1 | Sprawdź `robots.txt` | Przed requestem — parsujemy plik i pytamy "czy mogę?" |
| 2 | Rate limiting | Min. 5s przerwy między zapytaniami |
| 3 | Uczciwy User-Agent | Imię + e-mail w nagłówku — konfigurowalne przez `.env` |
| 4 | PII Detection | Regex na e-mail/telefon → jeśli znajdzie, zatrzymuje się |
| 5 | AI Feedback | OpenRouter analizuje wynik i daje ocenę etyczną |

---

## Struktura projektu

```
js-ai-scraping-example/
├── src/
│   ├── prompts/
│   │   └── scrape-feedback.md      # prompt do oceny etycznej przez AI
│   ├── services/
│   │   ├── robots.ts               # sprawdzanie robots.txt (brak pliku = dozwolone)
│   │   ├── scraper.ts              # pobieranie strony + obsługa HTTP 429
│   │   ├── pii-detector.ts         # wykrywanie danych osobowych
│   │   └── ai-feedback.ts          # zapytanie do OpenRouter
│   ├── utils/
│   │   ├── logger.ts               # zapis logów do logs/
│   │   └── menu.ts                 # interaktywne menu konsolowe (readline)
│   └── index.ts                    # główny punkt wejścia — orchestrator
├── logs/                           # logi aplikacji (auto-generowane)
├── config.json                     # timeouty, rate limit, model AI, przykładowe URL-e, wzorce PII
├── tsconfig.json
├── package.json
├── .env                            # OPENROUTER_API_KEY (nie commituj!)
├── .env.example                    # szablon zmiennych środowiskowych
├── Readme.md                       # dokumentacja w języku angielskim (zgodna z /wisniewk-doc-rules)
└── Agents.md                       # ten plik
```

---

## Konfiguracja

### `.env` — tylko sekrety

| Zmienna | Opis | Przykład |
|---------|------|---------|
| `OPENROUTER_API_KEY` | Klucz do OpenRouter | `sk-or-...` |

### `config.json` — wszystkie pozostałe ustawienia

| Klucz | Opis | Przykład |
|-------|------|---------|
| `scraperName` | Imię i nazwisko operatora | `Krzysztof Wisniewski` |
| `scraperEmail` | Kontakt do operatora | `wisniewskikr@gmail.com` |
| `rateLimitMs` | Przerwa między requestami (ms) | `5000` |
| `model` | Model AI w OpenRouter | `google/gemini-2.5-flash` |
| `exampleUrls` | Zaszyte URL-e dla opcji 1–4 | `{ "robotsBlocked": "...", ... }` |
| `piiPatterns` | Wzorce regex do wykrywania PII | `{ "email": "...", "phone": "..." }` |

---

## Stack

| Element | Technologia |
|---------|-------------|
| Język | TypeScript (strict mode) |
| Runtime | `tsx` (Node.js 18+) |
| HTTP | `fetch` (wbudowany w Node.js 18+) — zero dodatkowych zależności |
| robots.txt | `robots-parser` |
| Menu konsolowe | `readline` (wbudowany w Node.js) |
| OpenRouter | `openai` SDK (kompatybilne) — proste pytanie: "czy strona jest bezpieczna do scrapowania?" |
| Model AI | `google/gemini-2.5-flash` — szybki, tani, wystarczający do prostej analizy tekstu |
| Config | `dotenv` |

---

## Jak działa — krok po kroku

```
URL wejściowy
    │
    ▼
[1] robots.txt — czy mam pozwolenie?
    │  brak pliku → domyślnie dozwolone
    │  NIE → stop
    │  TAK ↓
[2] Ustaw User-Agent z imieniem i e-mailem
    │
    ▼
[3] Czekaj 5s z odliczaniem ("Waiting 5s... 4... 3...")
    │
    ▼
[4] Pobierz stronę
    │  HTTP 429 → zatrzymaj i ostrzeż ("Server says: slow down")
    │  OK ↓
[5] PII Detection — czy są e-maile / telefony?
    │  TAK → zatrzymaj i ostrzeż
    │  NIE ↓
[6] Wyślij do OpenRouter → ocena etyczna
    │
    ▼
Wynik w konsoli → powrót do menu
```

---

## Interfejs — menu konsolowe

Aplikacja startuje interaktywnym menu. Użytkownik wybiera opcję strzałkami / numerem.

```
=== Ethical Scraper Demo ===

Choose an example:
  [1] robots.txt BLOCKED   — https://www.google.com/search?q=ethical+scraping
  [2] robots.txt ALLOWED   — https://example.com
  [3] PII Detection        — https://www.iana.org/about/contacts
  [4] Rate Limiting        — https://example.com, https://example.org, https://example.net
  [5] Enter your own URL
  [0] Exit
```

### Przykłady URL i co pokazują

| Opcja | URL | Co demonstruje |
|-------|-----|---------------|
| 1 | `https://www.google.com/search?q=ethical+scraping` | robots.txt blokuje `/search` dla wszystkich botów (`Disallow: /search`) |
| 2 | `https://example.com` | robots.txt dozwalający wszystko |
| 3 | `https://www.iana.org/about/contacts` | PII detection — strona zawiera adresy e-mail (`iana@iana.org` itp.) |
| 4 | `https://example.com`, `https://example.org`, `https://example.net` | Rate limiting — 3 requesty z 5s przerwą między każdym |
| 5 | dowolny URL wpisany przez użytkownika | pełny przepływ |

---

## Uruchomienie

```bash
npm install
npm start
```

`package.json` definiuje skrypt `start` jako `tsx src/index.ts`.
