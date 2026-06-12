# Memory Triad — Demo

> Wyobraz sobie asystenta, ktory ma trzy rodzaje pamieci — jak czlowiek:
> - **Notes na biurku** — pamietasz co bylo mowione przed chwila
> - **Szuflada z dokumentami** — pamietasz dane na stale
> - **Dziennik** — zapisujesz co zrobiles i co wyszlo

---

## Czym jest Memory Triad?

| Warstwa | Analogia | Co przechowuje | Gdzie |
|---------|----------|----------------|-------|
| **Short-term** | Notes na biurku | Biezaca rozmowa (sesja) | Pamiec RAM (tablica) |
| **Long-term** | Szuflada z dokumentami | Imie, preferencje, dane uzytkownika | SQLite |
| **Epizodyczna** | Dziennik | Co agent zrobil i z jakim skutkiem | SQLite |

Wiekszosc agentow ma tylko pierwsza warstwe. Dlatego zapominaja wszystko po restarcie.

---

## Co robi ten projekt?

Prosty asystent CLI w TypeScript, ktory:

- pyta Cie przez menu o co chcesz zrobic
- odpowiada przez OpenRouter (model LLM)
- pamietasz co mowisz w tej sesji (short-term)
- zapamietuje Twoje dane miedzy uruchomieniami (long-term)
- zapisuje kazda swoja akcje do dziennika (epizodyczna)

---

## Menu CLI

```
Co chcesz zrobic?

  1. Przedstaw sie   — agent mowi kim jestes (long-term)
  2. Zapamiętaj moje imie  — zapisuje imie do bazy (long-term)
  3. Podsumuj nasza rozmowe — skrot tej sesji (short-term)
  4. Pokaz historię akcji  — co agent robil wczesniej (epizodyczna)
> 5. Wpisz wlasne pytanie  — pytanie do LLM z pelnym kontekstem
  6. Wyjście
```

---

## Stack

| Element | Biblioteka |
|---------|-----------|
| Jezyk | TypeScript strict (Node.js) |
| CLI | `@inquirer/prompts` |
| LLM API | OpenRouter (fetch) |
| Baza danych | `better-sqlite3` |
| Srodowisko | `dotenv` |

---

## Struktura projektu

```
project/
├── src/
│   ├── prompts/
│   │   ├── system.md          — glowny system prompt agenta
│   │   ├── summarize.md       — prompt do podsumowania sesji
│   │   └── introduce.md       — prompt do przedstawienia sie
│   ├── services/
│   │   ├── memory/
│   │   │   ├── shortTerm.ts   — tablica wiadomosci biezacej sesji
│   │   │   ├── longTerm.ts    — zapis/odczyt danych z SQLite
│   │   │   └── episodic.ts    — zapis akcji agenta do dziennika
│   │   ├── openrouter.ts      — wywolanie modelu przez OpenRouter
│   │   └── database.ts        — inicjalizacja i polaczenie SQLite
│   └── utils/
│       ├── menu.ts            — definicja i renderowanie opcji CLI
│       └── logger.ts          — zapis logow do katalogu logs/
├── logs/                      — logi aplikacji (auto-tworzone)
├── db/
│   └── memory.db              — baza SQLite (auto-tworzona)
├── index.ts                   — punkt wejscia, petla CLI
├── config.json                — model, limity, timeouty, nazwa bazy
├── .env                       — klucz OPENROUTER_API_KEY
├── .env.example               — szablon zmiennych srodowiskowych
└── Readme.md                  — dokumentacja (EN)
```

### Readme.md — zasady pisania

Plik w jezyku **angielskim**. Pisany jak dla 5-latka — prosto, bez zbednych slow.

| Sekcja | Co zawiera | Forma |
|--------|------------|-------|
| **Title + one-liner** | Co to jest w jednym zdaniu | Naglowek H1 |
| **What is it?** | Analogia do trzech warstw pamieci | 3 punkty z analogia |
| **Requirements** | Node.js, klucz API | Lista punktowana |
| **Installation** | `npm install`, skopiuj `.env` | Blok kodu krok po kroku |
| **Usage** | `npm run dev` + opis menu | Blok kodu |
| **Project structure** | Drzewo katalogow z opisami | Blok kodu |

Zasady (z doc-rules):

- Tabel i punktow uzyj wszedzie, gdzie mozliwe — zero scian tekstu
- Kazda analogia musi byc prosta: "short-term = notepad on your desk"
- Mniej znaczy lepiej — jesli mozna napisac krocej, napisz krocej

Przyklad otwierajacej sekcji Readme:

```markdown
# Memory Triad Demo

A CLI assistant that remembers — like a person does.

| Memory layer | Analogy | Lives in |
|---|---|---|
| Short-term | Notepad on your desk | RAM |
| Long-term | Filing cabinet | SQLite |
| Episodic | Personal diary | SQLite |

Most AI agents only have the first layer. This demo shows all three.
```

### config.json — co tu trafia

```json
{
  "model": "openai/gpt-4o-mini",
  "maxTokens": 1024,
  "dbPath": "./db/memory.db",
  "logsDir": "./logs",
  "sessionTimeoutMinutes": 60
}
```

Wszystkie wartosci konfiguracyjne tylko tutaj — nigdy w kodzie.

### logs/ — format wpisu

```
[2026-06-12 14:32:01] [INFO] Uzytkownik wybral opcje: Przedstaw sie
[2026-06-12 14:32:02] [INFO] Zaladowano dane z long-term: imie=Marek
[2026-06-12 14:32:03] [INFO] Odpowiedz agenta zapisana do pamieci epizodycznej
[2026-06-12 14:32:10] [WARN] Brak danych w long-term — pierwsza wizyta uzytkownika
[2026-06-12 14:35:00] [ERROR] Blad polaczenia z OpenRouter: timeout
```

---

## Przeplyw danych

```
Uzytkownik wybiera opcje
        |
        v
CLI zbiera kontekst z trzech warstw pamieci
        |
        v
Wysyla prompt do OpenRouter
        |
        v
Odpowiedz trafia do short-term (historia sesji)
        |
        v
Akcja zapisywana do pamieci epizodycznej
        |
        v
Wynik wyswietlany uzytkownikowi
```

---

## Przyklad dzialania

**Pierwsze uruchomienie:**
```
Agent: Nie znam Twojego imienia. Wybierz opcje 2, zeby sie przedstawic.
```

**Po wybraniu opcji 2:**
```
Twoje imie: Marek
Agent: Zapisalem. Czesc, Marek!
```

**Po restarcie programu, opcja 1:**
```
Agent: Czesc, Marek! Milo cie widziec ponownie.
       Ostatnio pytales o pogode (2 dni temu).
```

Bez Memory Triad — agent by zapomnial wszystko.

---

## Model AI

Porownanie modeli dostepnych przez OpenRouter dla tego projektu:

| Model | Koszt (1M tokenow) | Szybkosc | Jakosc dla CLI | Rekomendacja |
|-------|--------------------|----------|----------------|--------------|
| `google/gemini-flash-2.0` | ~$0.10 | bardzo szybki | dobra | backup |
| `openai/gpt-4o-mini` | ~$0.15 | szybki | dobra | backup |
| `anthropic/claude-haiku-4-5` | ~$0.80 | szybki | **bardzo dobra** | **wybor** |
| `anthropic/claude-sonnet-4-5` | ~$3.00 | sredni | swietna | za duzym kosztem |

**Wybrany model: `anthropic/claude-haiku-4-5`**

Dlaczego:

- Demo uczy o pamieci agenta — model musi dobrze rozumiec kontekst wstrzykniety z trzech warstw
- Haiku 4.5 radzi sobie z dlugim kontekstem lepiej niz gpt-4o-mini przy podobnym koszcie
- Szybki odpowiedz — CLI musi byc responsywne
- Wystarczajaco tani na potrzeby demo

---

## Konfiguracja

`.env` — tylko sekrety:
```env
OPENROUTER_API_KEY=sk-...
```

`config.json` — wszystko inne (model, limity, sciezki).
Model domyslny: `anthropic/claude-haiku-4-5` (szybki, dobry z kontekstem, optymalny dla tego demo)

---

## Uruchomienie

```bash
npm install
npm run dev
```
