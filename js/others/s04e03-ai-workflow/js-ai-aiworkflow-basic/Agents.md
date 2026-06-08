# s04e03 — Cicha degradacja workflows AI

> **Analogia:** Lodówka przestaje chłodzić, ale lampka wciąż świeci. Wszystko wygląda normalnie — dopóki jedzenie nie zacznie śmierdzieć.
> Ten projekt pokazuje, jak zapobiec takiej sytuacji w workflow AI.

---

## Co to jest?

Prosty projekt TypeScript + OpenRouter, który demonstruje dwie techniki zapobiegania cichej degradacji:

| Technika | Co robi |
|----------|---------|
| **Retry z Exponential Backoff + Jitter** | Inteligentnie ponawia nieudane wywołania API |
| **Monitoring (3 warstwy)** | Obserwuje czy workflow działa *i czy wynik ma sens* |

---

## Propozycja projektu: "News Summarizer"

**Scenariusz:** Co minutę pobieramy artykuł z Hacker News, wysyłamy do LLM przez OpenRouter i dostajemy podsumowanie w JSON.

**Dlaczego to dobre demo?**

- Prosto — jedno wywołanie LLM, jeden JSON na wyjściu
- Realnie — takie workflow naprawdę się psują w ciszy
- Widocznie — wszystkie awarie i metryki widać w konsoli

---

## Źródło artykułów

### Hacker News API

**Dlaczego Hacker News?**

| Cecha | Wartość |
|-------|---------|
| Koszt | Darmowe, bez limitu |
| Klucz API | Nie wymagany |
| Format | JSON — bez parsowania XML |
| Dostępność | Bardzo stabilne (Firebase) |

**Jak pobieramy artykuły?**

Dwa wywołania HTTP — bez żadnych zależności:

```
1. GET https://hacker-news.firebaseio.com/v0/topstories.json
   → lista ID: [43821, 43820, 43819, ...]

2. GET https://hacker-news.firebaseio.com/v0/item/43821.json
   → { title, url, text, score, by, time }
```

Artykuły mają pole `text` (posty z dyskusji) lub `url` (linki zewnętrzne). Na potrzeby demo używamy `title` + `text` jako wejście do LLM.

**Artykuły bez `text`:** Większość top stories to linki zewnętrzne — mają `url`, ale nie mają `text`. Podsumowanie z samego tytułu (5–10 słów) nie ma sensu. `news-fetcher.ts` pomija takie artykuły i loguje to jako metrykę:

```typescript
if (!item.text) {
  log.info({ layer: "pipeline", id: item.id }, "skipped — no text");
  continue;
}
```

**Deduplikacja:** Workflow działa co minutę, a top stories zmieniają się wolno. Ten sam artykuł nie powinien być przetwarzany dwa razy. Przed wywołaniem LLM sprawdzamy, czy plik już istnieje:

```typescript
const outputPath = `workflow/articles/${timestamp}-${id}.json`;
if (fs.existsSync(outputPath)) {
  log.info({ layer: "pipeline", id }, "skipped — already processed");
  continue;
}
```

**Kolejność pobierania:** `/v0/topstories.json` zwraca do 500 ID posortowanych według aktualnego rankingu HN (punkty + świeżość). Pobieramy pierwsze N z listy — czyli zawsze **top N najbardziej popularnych** w danej chwili, gdzie N = `workflow.articles` z `config.json`.

**Fallback — mock lokalny**

Jeśli HN API nie odpowiada (test offline, CI), `news-fetcher.ts` zwraca listę 5 przykładowych artykułów z pliku `mock-articles.ts`. Retry i monitoring działają identycznie.

---

## Struktura projektu

```
js-ai-aiworkflow-basic/
├── src/
│   ├── prompts/
│   │   └── summarize.md        # prompt do podsumowania artykułu (edytowalny bez zmian kodu)
│   ├── services/
│   │   ├── news-fetcher.ts     # pobiera artykuły z Hacker News API
│   │   ├── llm-client.ts       # wywołanie OpenRouter z p-retry
│   │   └── monitor.ts          # 3 warstwy monitoringu (pino)
│   ├── utils/
│   │   ├── cli.ts              # commander, ora spinners, chalk colors
│   │   └── mock-articles.ts    # fallback — lokalne dane testowe
│   ├── config.ts               # walidacja config.json przez Zod (fail-fast na starcie)
│   └── index.ts                # punkt wejścia, uruchamia workflow w pętli
├── workflow/
│   └── articles/                # pobrane artykuły — każdy w osobnym pliku JSON
├── logs/                        # logi aplikacji (tworzone automatycznie)
├── config.json                  # timeouty, limity, model, progi monitoringu
├── .env                         # klucze API (nie commituj!)
├── .env.example                 # szablon zmiennych środowiskowych
├── package.json
└── Readme.md                    # dokumentacja projektu (angielski)
```

### Co idzie gdzie?

| Plik | Co zawiera |
|------|------------|
| `src/prompts/summarize.md` | Prompt do LLM — edytujesz treść bez dotykania kodu |
| `src/services/llm-client.ts` | Wywołanie OpenRouter z `p-retry` |
| `src/services/news-fetcher.ts` | Pobieranie artykułów z HN API |
| `src/services/monitor.ts` | Zbieranie i logowanie metryk (3 warstwy) |
| `src/utils/cli.ts` | Commander flags, ora spinners, chalk colors |
| `src/utils/mock-articles.ts` | Fallback — dane testowe gdy HN nie odpowiada |
| `src/config.ts` | Zod schema + walidacja `config.json` przy starcie |
| `workflow/articles/` | Pobrane artykuły — każdy w osobnym pliku JSON |
| `config.json` | Wszystkie zmienne konfiguracyjne (bez sekretów) |
| `logs/app.log` | Logi z każdego uruchomienia |

**Format nazwy pliku:** `workflow/articles/{timestamp}-{id}.json`

Przykład: `workflow/articles/2026-06-08T10-01-00-43821.json`

```json
{
  "id": 43821,
  "fetchedAt": "2026-06-08T10:01:00Z",
  "title": "OpenAI raises $40B at $300B valuation",
  "text": "...",
  "summary": "OpenAI secured $40B in funding...",
  "topics": ["AI", "funding", "OpenAI"]
}
```

### Model AI

> **Analogia:** Do streszczenia gazety nie potrzebujesz profesora — wystarczy dobry student. Tanie i szybkie modele robią to świetnie.

Dla tego projektu liczy się:

| Kryterium | Dlaczego ważne |
|-----------|----------------|
| **Szybkość** | Workflow działa w pętli co minutę |
| **Koszt** | Każde wywołanie = tokeny = pieniądze |
| **JSON reliability** | Schema validation w Warstwie 3 wykryje każdy błąd struktury |
| **Jakość streszczeń** | Wystarczy dobra — nie potrzebujemy Opus do podsumowania newsa |

**Rekomendacja: `anthropic/claude-haiku-4-5`**

| Model | Szybkość | Koszt | JSON | Wybór |
|-------|----------|-------|------|-------|
| `anthropic/claude-haiku-4-5` | Bardzo szybki | Bardzo niski | Doskonały | **Rekomendowany** |
| `google/gemini-flash-2.0` | Bardzo szybki | Bardzo niski | Dobry | Dobra alternatywa |
| `openai/gpt-4o-mini` | Szybki | Niski | Dobry | Dobra alternatywa |
| `anthropic/claude-sonnet-4-5` | Wolniejszy | Wyższy | Doskonały | Gdy jakość ważniejsza niż koszt |

Haiku to najszybszy i najtańszy model Claude — idealny do powtarzalnych, prostych zadań jak streszczanie artykułów.

---

### `config.json` — przykład

```json
{
  "model": "anthropic/claude-haiku-4-5",
  "retry": {
    "attempts": 4,
    "minTimeoutMs": 1000,
    "factor": 2
  },
  "monitor": {
    "minSummaryLength": 50,
    "schemaErrorRateAlertThreshold": 0.05
  },
  "workflow": {
    "intervalMs": 60000,
    "articles": 3
  }
}
```

**Walidacja przy starcie — Zod**

> **Analogia:** Zanim zaczniesz gotować, sprawdzasz czy masz wszystkie składniki. Nie w połowie przepisu.

`config.json` jest walidowany przez Zod **zanim cokolwiek się uruchomi**. Brakujące lub błędne pole = natychmiastowy błąd z opisem, co jest nie tak:

```typescript
// src/config.ts
import { z } from "zod";

const ConfigSchema = z.object({
  model: z.string(),
  retry: z.object({
    attempts: z.number().min(1),
    minTimeoutMs: z.number().min(0),
    factor: z.number().min(1),
  }),
  monitor: z.object({
    minSummaryLength: z.number().min(1),
    schemaErrorRateAlertThreshold: z.number().min(0).max(1),
  }),
  workflow: z.object({
    intervalMs: z.number().min(1000),
    articles: z.number().min(1),
  }),
});

export const config = ConfigSchema.parse(JSON.parse(fs.readFileSync("config.json", "utf-8")));
```

Błędny `config.json` zatrzymuje aplikację na starcie — nie przy pierwszym wywołaniu LLM po minucie działania.

---

## Technika 1: Retry z Exponential Backoff + Jitter (`p-retry`)

### Analogia

> Zamiast wszyscy biec do drzwi jednocześnie — odczekaj chwilę, ale każdy odczekaj *trochę inaczej*.

### Exponential Backoff

Każda kolejna próba czeka coraz dłużej:

| Próba | Baza | Czeka |
|-------|------|-------|
| 1 | 1s | ~1s |
| 2 | 2s | ~2s |
| 3 | 4s | ~4s |
| 4 | 8s | ~8s |

### Jitter (losowe odchylenie)

Sam backoff nie wystarczy — bez jittera wszystkie instancje ruszają jednocześnie (efekt **Thundering Herd**).

`p-retry` ma wbudowany jitter (`randomize: true`) — jedna opcja zamiast własnej matematyki.

### Które błędy retryować?

| Błąd | Retry? | Dlaczego |
|------|--------|----------|
| HTTP 429 (rate limit) | Tak, z dłuższą przerwą | Serwer prosi o chwilę |
| HTTP 500 (błąd serwera) | Tak | Przejściowy problem |
| Timeout | Tak | Może być chwilowe przeciążenie |
| HTTP 400 (zły prompt) | Nie | Prompt się nie naprawi sam |

`p-retry` rozróżnia błędy przez `AbortError` — rzucamy go dla błędów, których nie chcemy retryować (np. 400).

### Implementacja w `llm-client.ts`

```typescript
import pRetry, { AbortError } from "p-retry";

export async function callLLM(text: string) {
  return pRetry(
    async () => {
      const res = await openai.chat.completions.create({
        model: config.model,
        response_format: { type: "json_object" },  // wymusza JSON na wyjściu
        messages: [{ role: "user", content: prompt + text }],
      });

      // token tracking — Warstwa 1
      log.info({
        layer: "infra",
        tokens: {
          prompt: res.usage?.prompt_tokens,
          completion: res.usage?.completion_tokens,
          total: res.usage?.total_tokens,
        },
      }, "token usage");

      return res;
    },
    {
      retries: 4,
      minTimeout: 1000,
      factor: 2,          // Exponential Backoff: 1s → 2s → 4s → 8s
      randomize: true,    // Jitter — losowe odchylenie
      onFailedAttempt: (err) => {
        if (err.response?.status === 400) throw new AbortError(err);
        log.warn({ attempt: err.attemptNumber, error: err.message }, "retry");
      },
    }
  );
}

---

## Technika 2: Monitoring (3 warstwy) z `pino`

### Analogia

> Klasyczny monitoring pyta: "Czy serwer żyje?". Monitoring AI pyta też: "Czy wynik ma sens?".

`pino` to logger strukturalny — zamiast tekstu wypisuje JSON. Każdy log to rekord z polami, który łatwo przeszukać, przefiltrować i wysłać do zewnętrznych narzędzi (Datadog, Loki, CloudWatch).

```typescript
// monitor.ts
import pino from "pino";
export const log = pino({ level: "info" });
```

### Warstwa 1: Infrastruktura

*Czy serwis w ogóle odpowiada?*

| Metryka | Co mierzymy |
|---------|-------------|
| Uptime | Czy API OpenRouter odpowiada |
| HTTP error rate | Ile % wywołań kończy się błędem |
| Latencja | Czas odpowiedzi w ms |
| Rate limit hits | Ile razy dostaliśmy 429 |
| Token usage | Prompt / completion / total tokens per wywołanie |

```typescript
// Warstwa 1 — log po każdym wywołaniu
log.info({ layer: "infra", latencyMs, status: res.status, tokens: res.usage?.total_tokens }, "llm call");
log.error({ layer: "infra", status: 429 }, "rate limit hit");
```

> **Po co liczyć tokeny?** Projekt podkreśla *"każde wywołanie = tokeny = pieniądze"*. Bez licznika nie widać, kiedy koszty rosną — np. gdy prompt przypadkowo urośnie albo model zaczyna generować długie odpowiedzi.

### Warstwa 2: Pipeline

*Czy dane przepływają?*

| Metryka | Co mierzymy |
|---------|-------------|
| Throughput | Ile zadań przetworzyliśmy na minutę |
| Retry rate | Ile % wywołań wymagało retry |
| Błędy po wyczerpaniu retry | Ile zadań "przepadło" |

```typescript
// Warstwa 2 — log po każdym zadaniu
log.info({ layer: "pipeline", processed, retries, failed }, "pipeline stats");
```

### Warstwa 3: Jakość outputu

*Czy wynik ma sens?*

| Kontrola | Co sprawdzamy | Alert gdy |
|----------|---------------|-----------|
| Schema validation | Czy JSON ma pola `summary`, `topics` | Brak pola |
| Length test | Czy podsumowanie ma > 50 znaków | Za krótkie = halucynacja |
| Canary check | Przed każdym runem — pytanie z jednoznaczną odpowiedzią | Odpowiedź inna niż oczekiwana |

```typescript
// Warstwa 3 — log po walidacji outputu
log.warn({ layer: "quality", check: "schema", field: "topics" }, "schema error");
log.warn({ layer: "quality", check: "length", chars: 12 }, "output too short");
log.error({ layer: "quality", check: "canary" }, "canary failed");
```

#### Canary check — jak to działa?

> **Analogia:** Zegarek sprawdzasz przez porównanie z zegarem wzorcowym — nie z własną pamięcią. Canary to taki zegar wzorcowy dla LLM.

LLM-y są **niedeterministyczne** — ten sam prompt może zwrócić inny tekst przy każdym wywołaniu. Porównywanie outputu z wcześniej zapisanym stringiem zawsze się posypie.

Zamiast tego canary wysyła proste pytanie z **jednoznaczną, sprawdzalną odpowiedzią**:

```typescript
// src/services/monitor.ts
const CANARY_PROMPT = 'Reply with only valid JSON: {"ok": true}';

export async function runHealthCheck(): Promise<boolean> {
  const res = await callLLM(CANARY_PROMPT);
  const parsed = JSON.parse(res);
  const passed = parsed?.ok === true;
  log.info({ layer: "quality", check: "canary", passed }, "health check");
  return passed;
}
```

**Dlaczego `runHealthCheck()` to osobna funkcja — nie licznik co-N-wywołań?**

| Podejście | Problem |
|-----------|---------|
| Co 5 wywołań w pętli | Miesza logikę canary z przetwarzaniem artykułów |
| Osobna funkcja przed runem | Prosta, testowalna, niezależna od liczby artykułów |

`runHealthCheck()` jest wywoływana w `index.ts` **przed** każdym runem. Jeśli zwróci `false` — run jest pomijany i logowany jako błąd.

---

## Jak to działa razem — przepływ danych

```
[services/news-fetcher.ts]
  Hacker News API
  └── fallback: utils/mock-articles.ts
        |
        v
[input: title + text artykułu]
        |
        v
[services/llm-client.ts]
  prompts/summarize.md ──► p-retry ──► OpenRouter API
        |                                    |
        |                             sukces / błąd
        |                                    |
        v                                    v
[services/monitor.ts]           Exponential Backoff
  Warstwa 1: Infrastruktura      + Jitter (p-retry)
  Warstwa 2: Pipeline
  Warstwa 3: Jakość outputu
        |
        v
[output: JSON]
  ├── workflow/articles/{timestamp}-{id}.json   ← każdy artykuł osobno
  └── logs/app.log                              ← metryki i zdarzenia
```

---

## Co zobaczysz w konsoli

Logi zapisywane do `logs/app.log` w formacie czytelnym dla człowieka:

```
[2026-06-08 10:01:00] [INFO]  llm call | latency=342ms status=200
[2026-06-08 10:01:01] [WARN]  retry attempt=2 error="rate limit (429)"
[2026-06-08 10:01:05] [WARN]  retry attempt=3 error="rate limit (429)"
[2026-06-08 10:01:10] [INFO]  pipeline stats | processed=12 retries=2 failed=0
[2026-06-08 10:01:10] [INFO]  quality check | schema=ok length=ok canary=ok
[2026-06-08 10:01:10] [ERROR] canary failed — sprawdz model!
```

`pino` konfigurujemy z transportem plikowym i formatowaniem przez `pino-pretty`:

```typescript
// src/services/monitor.ts
export const log = pino({
  transport: {
    targets: [
      {
        // Konsola: tylko warn i error — unika mieszania z ora spinnerami
        target: "pino-pretty",
        level: "warn",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
      {
        // Plik: pełne logi info+ do debugowania i metryk
        target: "pino-pretty",
        level: "info",
        options: { colorize: false, translateTime: "yyyy-mm-dd HH:MM:ss", destination: "logs/app.log", append: true },
      },
    ],
  },
});
```

---

## CLI

> All CLI communication is in **English**.

### Libraries

| Library | Role |
|---------|------|
| `commander` | Argument parsing — flags and options |
| `ora` | Spinner — shows progress during fetch and LLM call |
| `chalk` | Colors — green success, yellow warn, red error |

### 1. Input — how to start

```bash
npm run dev [options]

Options:
  --articles <n>    Articles to process per run    (default: 3)
  --interval <ms>   Milliseconds between runs       (default: 60000)
  --once            Run once and exit (no loop)
  --dry-run         Fetch articles, skip LLM call (monitoring still runs)
  --help            Show help
```

Examples:

```bash
npm run dev                            # loop, 3 articles/min
npm run dev -- --articles 5 --once    # run once, 5 articles
npm run dev -- --dry-run              # test fetcher without spending tokens
```

### 2. Process — what the user sees

```
AI Workflow — Silent Degradation Demo
======================================
Press Ctrl+C at any time to stop gracefully.

Run #1 — 2026-06-08 10:01:00

  Fetching top stories from Hacker News... done (312ms)

  [1/3] Processing: "OpenAI raises $40B at $300B valuation"
        ⠸ Calling LLM...
        ✔ Done (891ms)

  [2/3] Processing: "TypeScript 5.8 released"
        ⠸ Calling LLM...
        ⚠ Retry 2/4 — rate limit (429). Waiting 1847ms...
        ⚠ Retry 3/4 — rate limit (429). Waiting 3214ms...
        ✔ Done (6103ms)

  [3/3] Processing: "Canary check"
        ⠸ Calling LLM...
        ✖ Canary failed — output drift detected!

──────────────────────────────────────────
Run #1 Summary
  Processed : 3 articles
  Retries   : 2
  Failed    : 0
  Avg latency: 2961ms

  Monitoring
  Layer 1 Infra    : error_rate=0%  avg_latency=891ms
  Layer 2 Pipeline : retry_rate=33%  failed=0
  Layer 3 Quality  : schema=ok  length=ok  canary=FAIL ⚠
──────────────────────────────────────────

Next run in 60s. Press Ctrl+C to stop.
```

### 3. Output — result per article

```
┌─────────────────────────────────────────────────────┐
│ #1 OpenAI raises $40B at $300B valuation             │
├─────────────────────────────────────────────────────┤
│ Summary  │ OpenAI secured $40B in funding, pushing   │
│          │ its valuation to $300B. SoftBank led...   │
├─────────────────────────────────────────────────────┤
│ Topics   │ AI, funding, OpenAI, SoftBank             │
├─────────────────────────────────────────────────────┤
│ Saved to │ workflow/articles/2026-06-08T10-01-00-43821.json │
└─────────────────────────────────────────────────────┘
```

### CLI files in project structure

```
src/
├── utils/
│   └── cli.ts          ← commander setup, ora spinners, chalk colors
```

---

## Stack

| Co | Technologia |
|----|-------------|
| Jezyk | TypeScript (strict mode) |
| LLM API | OpenRouter |
| Runtime | Node.js (tsx) |
| Retry | `p-retry` — Exponential Backoff + Jitter + AbortError |
| Logging | `pino` + `pino-pretty` — logi do konsoli i `logs/app.log` |
| LLM SDK | `openai` (kompatybilne z OpenRouter) |
| Konfiguracja | `config.json` + `zod` — walidacja przy starcie |
| CLI | `commander` + `ora` + `chalk` |

---

## Graceful Shutdown

> **Analogia:** Nie wyciągaj wtyczki z komputera — użyj przycisku zamknięcia, żeby system zdążył zapisać pliki.

Bez obsługi sygnałów Ctrl+C (`SIGINT`) przerywa działanie w połowie przetwarzania artykułu. Plik JSON zostaje niekompletny, log urwany.

```typescript
// src/index.ts
let isShuttingDown = false;

process.on("SIGINT", () => {
  isShuttingDown = true;
  log.info("Shutdown signal received — finishing current article...");
});

// w pętli głównej
if (isShuttingDown) {
  log.info("Shutdown complete.");
  process.exit(0);
}
```

| Sygnał | Kiedy | Co robimy |
|--------|-------|-----------|
| `SIGINT` | Ctrl+C | Ustawiamy flagę, kończymy bieżący artykuł, wychodzimy |
| `SIGTERM` | kill / docker stop | To samo — jeden handler obsługuje oba |

Flaga `isShuttingDown` jest sprawdzana na początku każdej iteracji pętli. Workflow zawsze kończy bieżące zadanie przed wyjściem.

---

## Jak uruchomić

```bash
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

npm install
npm run dev               # default: loop, 3 articles/min
npm run dev --once        # run once and exit
npm run dev --dry-run     # no LLM calls, test fetcher + monitor (pino file output, canary skipped)
```

---

## Readme.md — zawartość

> Plik w języku angielskim. Pisany prosto — zrozumiały dla każdego, nie tylko programisty.

---

### # AI Workflow — Silent Degradation Demo

> **Analogy:** A fridge stops cooling, but the light inside still works. Everything looks fine — until the food starts to smell.
> This project shows how to prevent the same thing from happening in your AI workflow.

---

### ## What is it?

A TypeScript demo that shows two techniques for preventing silent AI workflow failures:

| Technique | What it does |
|-----------|-------------|
| **Retry (Exponential Backoff + Jitter)** | Retries failed API calls intelligently |
| **Monitoring (3 layers)** | Watches if the workflow runs *and if the output makes sense* |

---

### ## Requirements

| Tool | Version |
|------|---------|
| Node.js | >= 18 |
| npm | >= 9 |
| OpenRouter API key | free tier works |

---

### ## Installation

```bash
git clone <repo>
cd js-ai-aiworkflow-basic

cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

npm install
```

---

### ## Run

```bash
npm run dev
```

Logs appear in the console and in `logs/app.log`.

---

### ## File structure

```
src/
├── prompts/          ← edit AI prompts here, no code changes needed
├── services/         ← business logic (LLM, news fetcher, monitor)
└── utils/            ← helpers (mock data for offline testing)
logs/                 ← app logs (auto-created)
config.json           ← all config values (timeouts, limits, model)
.env                  ← API keys (never commit!)
```

---

### ## Configuration

All settings live in `config.json` — no hardcoded values in code:

| Key | What it controls |
|-----|-----------------|
| `model` | LLM model used via OpenRouter |
| `retry.attempts` | Max retry attempts |
| `retry.factor` | Backoff multiplier (2 = doubles each time) |
| `monitor.minSummaryLength` | Alert if output shorter than N chars |
| `workflow.intervalMs` | How often to run the workflow |
| `workflow.articles` | How many articles to fetch per run |

---

> **One sentence:** Build workflows as if every external call can fail — because sooner or later, it will.

---

> **Podsumowanie jednym zdaniem:** Buduj workflow tak, jakby każde zewnętrzne wywołanie mogło zawieść — bo prędzej czy później zawiedzie.
