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

## Jezyk komunikacji

Cala komunikacja przez CLI — menu, pytania, odpowiedzi agenta — w jezyku **angielskim**.

Dotyczy:
- tekstu menu i opcji
- odpowiedzi agenta (system prompt wymusza EN)
- komunikatow bledu i potwierdzen
- logow w katalogu `logs/`

---

## Menu CLI

```
What would you like to do?

  1. Add some information about you — saves any fact to long-term memory
  2. Summarize session              — summary of this conversation (short-term)
  3. Introduce me                   — agent tells who you are (long-term)
  4. Show action log                — what the agent did before (episodic)
  5. Clear session                  — clears short-term memory (current conversation only)
  6. Clear my data                  — remove all long-term and episodic memory
  7. Exit
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
│   │   ├── system.md              — glowny system prompt agenta
│   │   ├── summarize.md           — prompt do podsumowania sesji
│   │   ├── introduce.md           — prompt do przedstawienia sie
│   │   └── context-builder.ts     — skleja kontekst z trzech warstw w jeden string
│   ├── memory/
│   │   ├── MemoryManager.ts       — fasada: dostep do wszystkich trzech warstw
│   │   ├── shortTerm.ts           — tablica wiadomosci biezacej sesji (z auto-trim)
│   │   ├── longTerm.ts            — generyczny key-value store na SQLite
│   │   └── episodic.ts            — zapis akcji + podsumowanie ostatnich N wpisow
│   ├── services/
│   │   ├── openrouter.ts          — wywolanie modelu przez OpenRouter
│   │   └── database.ts            — inicjalizacja i polaczenie SQLite
│   └── cli/
│       ├── menu.ts                — definicja i renderowanie opcji CLI
│       ├── handlers.ts            — logika dla kazdej opcji menu
│       └── logger.ts              — zapis logow do katalogu logs/
├── logs/                          — logi aplikacji (auto-tworzone)
├── db/
│   └── memory.db                  — baza SQLite (auto-tworzona)
├── index.ts                       — punkt wejscia, petla CLI
├── config.json                    — model, limity, timeouty, nazwa bazy
├── .env                           — klucz OPENROUTER_API_KEY
├── .env.example                   — szablon zmiennych srodowiskowych
└── Readme.md                      — dokumentacja (EN)
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
  "model": "anthropic/claude-haiku-4-5",
  "maxTokens": 1024,
  "dbPath": "./db/memory.db",
  "logsDir": "./logs",
  "sessionTimeoutMinutes": 60,
  "maxShortTermMessages": 20,
  "maxEpisodicSummaryEntries": 5
}
```

Wszystkie wartosci konfiguracyjne tylko tutaj — nigdy w kodzie.

- `maxShortTermMessages` — limit wiadomosci w pamieci krotkoterminowej; po przekroczeniu najstarsze sa usuwane
- `maxEpisodicSummaryEntries` — ile ostatnich epizodow trafia do system promptu jako kontekst

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
handler.ts wywoluje MemoryManager
        |
        v
context-builder.ts skleja:
  longTerm.getAll()          → [KNOWN FACTS]
  episodic.getRecent(N)      → [RECENT ACTIONS]
  shortTerm.getMessages()    → messages[]
        |
        v
Wysyla prompt do OpenRouter (system + messages)
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

## Schemat bazy danych SQLite

```sql
-- Pamiec dlugoterminowa: generyczny key-value store
CREATE TABLE IF NOT EXISTS user_data (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Pamiec epizodyczna: dziennik akcji agenta
CREATE TABLE IF NOT EXISTS action_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  action    TEXT NOT NULL,
  result    TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
```

---

## Strategia wstrzykiwania kontekstu

Kluczowa decyzja architektoniczna: jak trzy warstwy pamieci trafiaja do promptu.

`context-builder.ts` skleja je w jeden string i wstrzykuje do system promptu przed kazdym wywolaniem modelu:

```
[BASE SYSTEM PROMPT]         — z pliku system.md

[KNOWN FACTS ABOUT USER]     — z long-term (key-value)
name=Marek
preference=dark_mode

[RECENT AGENT ACTIONS]       — ostatnie N wpisow z episodic
2026-06-12 14:32 | Introduce me | Told user their name is Marek
2026-06-12 14:35 | Ask question | Answered question about memory layers

[CONVERSATION HISTORY]       — short-term jako messages[]
user: what is episodic memory?
assistant: Episodic memory stores what I did and with what result...
```

Zasady budowania kontekstu:

| Warstwa | Gdzie w promptcie | Format |
|---------|------------------|--------|
| Long-term | System prompt (sekcja KNOWN FACTS) | `key=value` per linia |
| Episodic | System prompt (sekcja RECENT ACTIONS) | `timestamp \| action \| result` |
| Short-term | Tablica `messages[]` przekazana do API | role/content pairs |

Dzieki temu agent nie tylko *wyswietla* co zrobil — faktycznie *uzywa* historii przy odpowiedziach.

---

## Przyklad dzialania

**Pierwsze uruchomienie:**
```
Agent: Nie znam Twojego imienia. Wybierz opcje 2, zeby sie przedstawic.
```

**Po wybraniu opcji 1:**
```
What kind of information? (e.g. name, hobby, preference): name
Value for "name": Marek
Got it! I'll remember: name = Marek.
```

**Po restarcie programu, opcja 3:**
```
Agent: Czesc, Marek! Milo cie widziec ponownie.
       Ostatnio pytales o pogode (2 dni temu).
```

Bez Memory Triad — agent by zapomnial wszystko.

**Po wybraniu opcji 5 (Clear session):**
```
Session cleared. I no longer remember this conversation, but your saved data is intact.
```

**Po wybraniu opcji 6 (Clear my data):**
```
All your data has been removed. I no longer know who you are.
```

To pokazuje demo w obie strony: agent pamięta *i* potrafi zapomnieć.

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
