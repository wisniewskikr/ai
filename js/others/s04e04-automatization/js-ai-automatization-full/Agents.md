# Agents.md — Propozycja demo: Bezpieczna automatyzacja AI

## Co to jest?

Wyobraź sobie zegarmistrza. Nie wystarczy, że zegar tyka — trzeba też sprawdzać, czy tyka **o właściwej godzinie**, **nie za szybko**, i **wysłać alarm gdy stanie**.

To jest właśnie ten projekt: prosty agent TypeScript + OpenRouter, który generuje codzienny raport AI — i robi to **bezpiecznie**.

---

## Stack

| Element | Technologia |
|---------|-------------|
| Język | TypeScript (Node.js) |
| AI | OpenRouter API (`openai` SDK) |
| Strefa czasowa | `luxon` z jawnym `Europe/Warsaw` |
| Lock file | `proper-lockfile` |
| Heartbeat | `healthchecks.io` (free tier) + `fetch` |
| Alert na fail | `console.error` + Slack webhook |

---

## Scenariusz: "Codzienny digest nagłówków"

Agent dostaje plik `data/news.json` (mockowe nagłówki newsów z timestampem) i prosi OpenRouter o wygenerowanie krótkiego podsumowania w formacie JSON. Wynik trafia do `results/report.json`.

Wyobraź sobie listonosza, który co rano przynosi gazetę — ale najpierw sprawdza, czy gazeta nie jest sprzed tygodnia, czy jest kompletna, i zostawia kartkę w skrzynce gdy coś nie gra.

---

## Flow danych

```
data/news.json          →  validate input (timestamp < 24h?)
       ↓
OpenRouter prompt       →  "Podsumuj te nagłówki jako JSON: { summary, topics }"
       ↓
validate output         →  JSON? summary.length > 100? topics.length > 0?
       ↓
results/report.json     →  zapisz wynik
       ↓
heartbeat ping          →  sukces
```

Każdy krok, który się nie powiedzie → **głośny alert**.

---

## Co agent robi?

Jeden skrypt (`src/agent.ts`) uruchamiany np. cronjobem o 9:00 Europe/Warsaw.

```
[START]
  → sprawdź lock (czy już działa?)
  → sprawdź dane wejściowe (czy są świeże?)
  → wywołaj OpenRouter
  → zwaliduj output (JSON? > 100 znaków?)
  → wyślij heartbeat ping
  → zwolnij lock
[KONIEC]
```

---

## 6 komponentów bezpieczeństwa

| # | Komponent | Co konkretnie sprawdza | Jak to działa |
|---|-----------|------------------------|---------------|
| 1 | **Jawna strefa czasowa** | Czy godzina uruchomienia to 9:00–9:05 Europe/Warsaw? Poza oknem → alert | `luxon` — `DateTime.now().setZone('Europe/Warsaw')` |
| 2 | **Weryfikacja danych wejściowych** | Czy `news.json` ma pole `generatedAt` i czy to nie więcej niż 24h temu? | Porównanie timestamp z aktualną godziną |
| 3 | **Walidacja outputu** | Czy odpowiedź to `{ summary: string, topics: string[] }`? Czy `summary.length > 100`? | JSON.parse + sprawdzenie pól i długości |
| 4 | **Heartbeat** | Ping po każdym **udanym** uruchomieniu | `fetch('https://hc-ping.com/UUID')` na końcu |
| 5 | **Lock file** | Plik `.agent.lock` — jeśli istnieje i ma < 30 min → exit bez błędu | `proper-lockfile` — druga instancja odpuszcza |
| 6 | **Alert na fail** | Każdy `throw` → głośny komunikat | `console.error` + opcjonalny Slack webhook |

---

## CLI — komunikacja z użytkownikiem

Cała interakcja odbywa się przez terminal w języku angielskim. Po uruchomieniu (`npm start`) użytkownik widzi menu:

```
╔══════════════════════════════════════════╗
║       Daily News Digest Agent            ║
║  Press Ctrl+C at any time to exit safely ║
╚══════════════════════════════════════════╝

Select mode:
  1. Run normally     (cron every 1 min, clean data)
  2. Simulate error   — stale input data
  3. Simulate error   — invalid AI output
  4. Simulate error   — heartbeat failure
  5. Simulate error   — lock file conflict
  6. Exit

> _
```

| Opcja | Co robi | Czego uczy |
|-------|---------|------------|
| **1. Run normally** | Uruchamia crona co 1 minutę na poprawnych danych (interwał w `config.json`) | Pokazuje happy path — wszystkie 6 komponentów działa poprawnie. Gdy wszystko OK — agent działa cicho, regularnie i przewidywalnie |
| **2. Stale input** | Podmienia timestamp w `news.json` na >24h wstecz | Alert z komponentu 2 — weryfikacja danych wejściowych |
| **3. Invalid output** | Zwraca zniekształcony JSON z OpenRouter (mock) | Alert z komponentu 3 — walidacja outputu |
| **4. Heartbeat failure** | Blokuje ping do healthchecks.io | Alert z komponentu 4 — heartbeat |
| **5. Lock conflict** | Uruchamia dwie instancje jednocześnie | Alert z komponentu 5 — lock file |
| **6. Exit** | Czyste zamknięcie programu | — |

### Opcja 1 — rezultat (happy path)

Pełny output jednego runa:

```
⠋ Processing articles...

[INFO] Lock acquired
[INFO] Input data is fresh (generatedAt: 2026-06-09 08:55 Warsaw)
[INFO] OpenRouter response received
[INFO] Output valid — summary: 143 chars, topics: 4
[INFO] Report saved → results/report.json
[INFO] Heartbeat sent ✓
[INFO] Lock released

Next run in: 00:59  (Ctrl+C to stop)
```

Zawartość `results/report.json` po udanym runie:

```json
{
  "generatedAt": "2026-06-09T09:00:12.000+02:00",
  "summary": "Today's headlines focus on AI regulation in Europe...",
  "topics": ["AI", "regulation", "Europe", "tech"]
}
```

Po minucie — to samo od nowa. Run #2, #3, #4...

---

### Spinner — aplikacja pracuje w tle

Podczas przetwarzania artykułów (wywołanie OpenRouter, walidacja, zapis) wyświetla się animowany spinner:

```
⠋ Processing articles...
⠙ Processing articles...
⠹ Processing articles...
```

Spinner znika gdy run się kończy (sukces lub błąd). Biblioteka: `ora` (lekka, zero zależności).

### Odliczanie do następnego runa (opcja 1)

Po zakończeniu każdego runa wyświetla się odliczanie w tej samej linii (`\r`):

```
[INFO] Run #3 completed successfully
Next run in: 00:47  (Ctrl+C to stop)
Next run in: 00:46  (Ctrl+C to stop)
Next run in: 00:45  (Ctrl+C to stop)
```

Gdy odliczanie dojdzie do zera — spinner startuje natychmiast.

**Ctrl+C** działa zawsze — grzecznie kończy crona, zwalnia lock, loguje `[INFO] Agent stopped by user`.

Interwał crona (domyślnie `1` minuta) konfigurowalny w `config.json`:

```json
"cronIntervalMinutes": 1
```

---

## Zachowanie przy błędzie

| Sytuacja | Zachowanie | Dlaczego |
|----------|------------|---------|
| Błąd w cron run (opcja 1) | Loguj + alert, **kontynuuj crona** | Jedna awaria nie powinna zabijać schedulera |
| Błąd w symulacji (opcje 2–5) | Pokaż alert, **wróć do menu** | Demo — użytkownik chce eksplorować kolejne opcje |
| Lock conflict | Pomiń ten run, **czekaj na następny tick** | Poprzednia instancja jeszcze działa — to normalne |
| Ctrl+C / opcja 6 | **Zatrzymaj wszystko** gracefully | Jedyny sposób na pełne wyjście |

**Błąd w cron run** — flow:

```
[Run #1] → stale data detected → ALERT → log ERROR → run failed
[Run #2] → 1 min later → try again normally
[Run #3] → ...
```

**Błąd w symulacji** — flow:

```
> 2 (stale input)
[ERROR] Input data is 26h old — refusing to generate report
[ALERT] Stale data alert sent

Press Enter to return to menu...
> _
```

---

## Jak zasymulować awarię?

Przez menu CLI — bez ręcznego edytowania plików. Każda symulacja wyświetla alert w terminalu i zapisuje wpis do `logs/`.

---

## Struktura plików

```
project/
├── src/
│   ├── prompts/
│   │   └── digest.md          ← prompt do OpenRouter (edytowalny bez zmiany kodu)
│   ├── services/
│   │   ├── agent.ts           ← główna logika, łączy wszystko
│   │   ├── openrouter.ts      ← wywołanie OpenRouter API
│   │   ├── lock.ts            ← lock file (acquire / release)
│   │   └── heartbeat.ts       ← ping do healthchecks.io
│   └── utils/
│       ├── validate.ts        ← walidacja inputu i outputu
│       ├── alert.ts           ← alert na fail (console + Slack)
│       └── logger.ts          ← zapis logów do logs/
├── data/
│   └── news.json              ← mockowe dane wejściowe (z timestampem)
├── results/
│   └── report.json            ← wynik działania agenta
├── logs/                      ← logi aplikacji (auto-generowane)
├── config.json                ← wszystkie zmienne konfiguracyjne
├── .env                       ← OPENROUTER_API_KEY (nie commituj!)
├── .env.example               ← szablon zmiennych środowiskowych
├── package.json
├── tsconfig.json
└── Readme.md                  ← dokumentacja w języku angielskim
```

---

## config.json — zmienne konfiguracyjne

```json
{
  "timezone": "Europe/Warsaw",
  "scheduleHour": 9,
  "scheduleWindowMinutes": 5,
  "maxInputAgeHours": 24,
  "minOutputLength": 100,
  "lockFilePath": ".agent.lock",
  "lockTtlMinutes": 30,
  "heartbeatUrl": "https://hc-ping.com/YOUR-UUID",
  "model": "google/gemini-2.0-flash-001",
  "logsDir": "logs",
  "resultsDir": "results"
}
```

Zmiana modelu, strefy, limitów — tylko tu. Bez dotykania kodu.

---

## Przykładowy flow (pseudokod)

```typescript
// src/services/agent.ts
import config from '../../config.json';

// 1. Jawna strefa czasowa z config.json
const now = DateTime.now().setZone(config.timezone);

// 2. Lock file — czy już działa?
await lock.acquire(config.lockFilePath, config.lockTtlMinutes);

// 3. Weryfikacja danych wejściowych
if (isOlderThan(inputData.generatedAt, config.maxInputAgeHours)) {
  await alert.send('Dane za stare — odmowa generacji raportu');
  await lock.release();
  process.exit(1);
}

// 4. Wywołanie OpenRouter (prompt z src/prompts/digest.md)
const response = await openrouter.chat(prompt, config.model);

// 5. Walidacja outputu
if (!isValidOutput(response, config.minOutputLength)) {
  await alert.send('Output niepoprawny — raport nie wysłany');
  await lock.release();
  process.exit(1);
}

// 6. Heartbeat — sukces
await heartbeat.ping(config.heartbeatUrl);

// 7. Zwolnij lock
await lock.release();
```

---

## Model AI — rekomendacja

To zadanie jest proste: nagłówki wchodzą → JSON wychodzi. Nie potrzeba "mózgu" — potrzeba **szybkości i dokładności JSON-a**.

Jak wybór samochodu do zakupów: nie bierzesz Ferrari, bierzesz coś niezawodnego i taniego.

| Model (OpenRouter) | Cena input/M | Cena output/M | JSON output | Szybkość | Ocena |
|--------------------|-------------|--------------|-------------|----------|-------|
| `google/gemini-2.0-flash-001` | $0.10 | $0.40 | ✅ świetny | ⚡ bardzo szybki | ✅ **rekomendowany** |
| `openai/gpt-4o-mini` | $0.15 | $0.60 | ✅ świetny | ⚡ bardzo szybki | dobry backup |
| `anthropic/claude-haiku-4-5` | $0.80 | $4.00 | ✅ bardzo dobry | ⚡ szybki | za drogi do tego zadania |
| `anthropic/claude-sonnet-4-5` | $3.00 | $15.00 | ✅ doskonały | średni | zdecydowanie za drogi |

**Rekomendacja: `google/gemini-2.0-flash-001`**

- Najtańszy model z niezawodnym JSON output
- Wystarczający do prostego summarization
- Łatwa zamiana w `config.json` — bez zmiany kodu

---

## Dlaczego TypeScript + OpenRouter?

| Powód | Wyjaśnienie |
|-------|-------------|
| TypeScript strict | Typy wyłapują błędy walidacji już na etapie pisania kodu |
| OpenRouter | Jeden klucz API, łatwa zamiana modelu w `config.json` bez zmiany kodu |
| `config.json` | Wszystkie wartości konfiguracyjne w jednym miejscu — zero hardcodowania |
| `src/prompts/` | Prompt edytowalny bez znajomości kodu — może go zmienić każdy |

---

## Readme.md — proponowana treść

> Plik w języku angielskim, styl: prosto jak dla 5-latka, tabele, analogie.

---

```markdown
# Daily News Digest Agent

Think of this as a postman who checks the newspaper before delivering it:
is it today's edition? Is it complete? If not — he leaves a note and rings the alarm.

This agent fetches news headlines, asks AI to summarize them, and saves the result.
Every step has a safety check.

---

## Requirements

| Tool    | Version  |
|---------|----------|
| Node.js | >= 20    |
| npm     | >= 10    |

---

## Setup

1. Clone the repo
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Copy `.env.example` to `.env` and add your OpenRouter key:
   \`\`\`
   OPENROUTER_API_KEY=your-key-here
   \`\`\`
4. (Optional) Set your heartbeat URL in `config.json`:
   \`\`\`json
   "heartbeatUrl": "https://hc-ping.com/YOUR-UUID"
   \`\`\`

---

## Run

\`\`\`bash
npm start
\`\`\`

To simulate a failure — edit `data/news.json` and set `generatedAt` to yesterday.

---

## How it works

| Step | What happens            | Fails when...                     |
|------|-------------------------|-----------------------------------|
| 1    | Check timezone          | Run outside 9:00–9:05 Warsaw time |
| 2    | Acquire lock            | Another instance is already running |
| 3    | Validate input          | `news.json` is older than 24h     |
| 4    | Call OpenRouter         | API error or timeout              |
| 5    | Validate output         | Response is not valid JSON or too short |
| 6    | Send heartbeat ping     | No internet                       |
| 7    | Release lock            | Always runs (finally block)       |

---

## File structure

\`\`\`
src/
  prompts/digest.md     ← edit the AI prompt here
  services/agent.ts     ← main logic
  services/openrouter.ts
  services/lock.ts
  services/heartbeat.ts
  utils/validate.ts
  utils/alert.ts
  utils/logger.ts
data/news.json          ← input data (with timestamp)
results/report.json     ← output
logs/                   ← auto-generated logs
config.json             ← all config values (model, limits, paths)
.env                    ← API keys (never commit!)
\`\`\`
```

---

## Co pokazuje ten demo?

> **Różnica między automatyzacją, której ufasz, a automatyzacją, za którą się modlisz — to te 20 linijek.**
> — Readme-security-pl.md, s04e04

Demo pokazuje, że "działa" to za mało. Agent musi **wiedzieć, że działa** — i **krzyczeć, gdy nie działa**.
