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

## Jak zasymulować awarię?

- Podmień `generatedAt` w `news.json` na wczorajszy timestamp → zobaczysz alert z komponentu 2
- Uruchom skrypt dwa razy jednocześnie → druga instancja grzecznie odpuści (komponent 5)
- Wyłącz internet → heartbeat nie dotrze → healthchecks.io wyśle e-mail po upływie okna czasowego (komponent 4)

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

## Dlaczego TypeScript + OpenRouter?

| Powód | Wyjaśnienie |
|-------|-------------|
| TypeScript strict | Typy wyłapują błędy walidacji już na etapie pisania kodu |
| OpenRouter | Jeden klucz API, łatwa zamiana modelu w `config.json` bez zmiany kodu |
| `config.json` | Wszystkie wartości konfiguracyjne w jednym miejscu — zero hardcodowania |
| `src/prompts/` | Prompt edytowalny bez znajomości kodu — może go zmienić każdy |

---

## Co pokazuje ten demo?

> **Różnica między automatyzacją, której ufasz, a automatyzacją, za którą się modlisz — to te 20 linijek.**
> — Readme-security-pl.md, s04e04

Demo pokazuje, że "działa" to za mało. Agent musi **wiedzieć, że działa** — i **krzyczeć, gdy nie działa**.
