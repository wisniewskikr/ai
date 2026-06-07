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
│   └── scraper.ts        # cały kod w jednym miejscu
├── .env.example          # klucz API + dane kontaktowe
├── package.json
└── Agents.md             # ten plik
```

---

## Konfiguracja (`.env`)

| Zmienna | Opis | Przykład |
|---------|------|---------|
| `OPENROUTER_API_KEY` | Klucz do OpenRouter | `sk-or-...` |
| `SCRAPER_NAME` | Imię i nazwisko operatora | `Krzysztof Wisniewski` |
| `SCRAPER_EMAIL` | Kontakt do operatora | `wisniewskikr@gmail.com` |

---

## Stack

| Element | Technologia |
|---------|-------------|
| Język | TypeScript |
| Runtime | `tsx` (Node.js) |
| robots.txt | `robots-parser` |
| OpenRouter | `openai` SDK (kompatybilne) — proste pytanie: "czy strona jest bezpieczna do scrapowania?" |
| Config | `dotenv` |

---

## Jak działa — krok po kroku

```
URL wejściowy
    │
    ▼
[1] robots.txt — czy mam pozwolenie?
    │  NIE → stop
    │  TAK ↓
[2] Ustaw User-Agent z imieniem i e-mailem
    │
    ▼
[3] Czekaj 5s (rate limit)
    │
    ▼
[4] Pobierz stronę
    │
    ▼
[5] PII Detection — czy są e-maile / telefony?
    │  TAK → zatrzymaj i ostrzeż
    │  NIE ↓
[6] Wyślij do OpenRouter → ocena etyczna
    │
    ▼
Wynik w konsoli
```

---

## Interfejs — menu konsolowe

Aplikacja startuje interaktywnym menu. Użytkownik wybiera opcję strzałkami / numerem.

```
=== Etyczny Scraper Demo ===

Wybierz przykład:
  [1] robots.txt ZABLOKOWANY  — https://en.wikipedia.org/wiki/Main_Page
  [2] robots.txt DOZWOLONY    — https://example.com
  [3] PII Detection           — https://www.iana.org/about/contacts
  [4] Rate Limiting           — https://example.com, https://example.org, https://example.net
  [5] Wpisz własny URL
  [0] Wyjście
```

### Przykłady URL i co pokazują

| Opcja | URL | Co demonstruje |
|-------|-----|---------------|
| 1 | `https://en.wikipedia.org/wiki/Main_Page` | robots.txt z regułami dla botów |
| 2 | `https://example.com` | robots.txt dozwalający wszystko |
| 3 | `https://www.iana.org/about/contacts` | PII detection — strona zawiera adresy e-mail (`iana@iana.org` itp.) |
| 4 | `https://example.com`, `https://example.org`, `https://example.net` | Rate limiting — 3 requesty z 5s przerwą między każdym |
| 5 | dowolny URL wpisany przez użytkownika | pełny przepływ |

---

## Uruchomienie

```bash
npx tsx src/scraper.ts
```
