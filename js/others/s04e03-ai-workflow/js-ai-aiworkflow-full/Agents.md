# s04e03 — Cicha degradacja workflows AI

> **Analogia:** Lodówka przestaje chłodzić, ale lampka wciąż świeci. Wszystko wygląda normalnie — dopóki jedzenie nie zacznie śmierdzieć.
> Ten projekt pokazuje, jak zapobiec takiej sytuacji w workflow AI.

---

## Co to jest?

Prosty projekt TypeScript + OpenRouter, który demonstruje cztery techniki zapobiegania cichej degradacji:

| Technika | Co robi |
|----------|---------|
| **Retry z Exponential Backoff + Jitter** | Inteligentnie ponawia nieudane wywołania API |
| **Monitoring (3 warstwy)** | Obserwuje czy workflow działa *i czy wynik ma sens* |
| **Circuit Breaker** | Chroni przed kaskadą awarii — zatrzymuje żądania gdy usługa pada |
| **Dead Letter Queue** | Chroni przed utratą danych — przechowuje nieudane zadania do ponownego przetworzenia |

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
const outputPath = `workspace/articles/${timestamp}-${id}.json`;
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
js-ai-aiworkflow-full/
├── src/
│   ├── prompts/
│   │   └── summarize.md        # prompt do podsumowania artykułu (edytowalny bez zmian kodu)
│   ├── services/
│   │   ├── news-fetcher.ts     # pobiera artykuły z Hacker News API
│   │   ├── llm-client.ts       # wywołanie OpenRouter z p-retry
│   │   ├── circuit-breaker.ts  # circuit breaker (opossum) — 3 stany
│   │   ├── dlq.ts              # Dead Letter Queue — SQLite przez better-sqlite3
│   │   └── monitor.ts          # 3 warstwy monitoringu (pino)
│   ├── utils/
│   │   ├── cli.ts              # commander, inquirer menu, ora spinners, chalk colors
│   │   ├── simulate.ts         # mock API responses dla opcji 3–5 (retry/canary/breaker)
│   │   └── mock-articles.ts    # fallback — lokalne dane testowe
│   ├── config.ts               # walidacja config.json przez Zod (fail-fast na starcie)
│   └── index.ts                # punkt wejścia, uruchamia workflow w pętli
├── workspace/
│   ├── articles/                # pobrane artykuły — każdy w osobnym pliku JSON
│   └── dlq.db                   # Dead Letter Queue — SQLite (tworzona automatycznie)
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
| `src/services/circuit-breaker.ts` | Circuit breaker (`opossum`) — 3 stany: zamknięty / otwarty / półotwarty |
| `src/services/dlq.ts` | Dead Letter Queue — SQLite, nieudane zadania do ponownego przetworzenia |
| `src/services/monitor.ts` | Zbieranie i logowanie metryk (3 warstwy) |
| `src/utils/cli.ts` | Commander flags, inquirer menu, ora spinners, chalk colors |
| `src/utils/simulate.ts` | Mock API responses dla opcji 3–5 (retry / canary / circuit breaker) |
| `src/utils/mock-articles.ts` | Fallback — dane testowe gdy HN nie odpowiada |
| `src/config.ts` | Zod schema + walidacja `config.json` przy starcie |
| `workspace/articles/` | Pobrane artykuły — każdy w osobnym pliku JSON |
| `workspace/dlq.db` | Dead Letter Queue — SQLite (tworzona automatycznie) |
| `config.json` | Wszystkie zmienne konfiguracyjne (bez sekretów) |
| `logs/app.log` | Logi z każdego uruchomienia |

**Format nazwy pliku:** `workspace/articles/{timestamp}-{id}.json`

Przykład: `workspace/articles/2026-06-08T10-01-00-43821.json`

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
  "circuitBreaker": {
    "failureThreshold": 5,
    "successThreshold": 2,
    "timeoutMs": 60000
  },
  "monitor": {
    "minSummaryLength": 50,
    "schemaErrorRateAlertThreshold": 0.05
  },
  "dlq": {
    "reprocessBatchSize": 3,
    "maxSize": 100
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
  circuitBreaker: z.object({
    failureThreshold: z.number().min(1),
    successThreshold: z.number().min(1),
    timeoutMs: z.number().min(1000),
  }),
  monitor: z.object({
    minSummaryLength: z.number().min(1),
    schemaErrorRateAlertThreshold: z.number().min(0).max(1),
  }),
  dlq: z.object({
    reprocessBatchSize: z.number().min(1),
    maxSize: z.number().min(1),
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

### Uwaga: kolejność retry i circuit breaker

**Retry musi być na zewnątrz circuit breakera — nie w środku.**

```
❌ źle:  breaker.fire() → [retry x4 wewnątrz] → wynik
✅ dobrze: retry → breaker.fire() → API
```

Jeśli retry jest zagnieżdżony wewnątrz wywołania, które owija circuit breaker, breaker widzi jedno wywołanie trwające kilka minut — nieważne, że wewnątrz było 4 próby. Błędy przejściowe nie liczą się do progu otwarcia, bo breaker nie wie, że były ponawiane.

Przy prawidłowej kolejności: każda próba retry wywołuje `breaker.fire()` osobno, więc wszystkie błędy rejestrują się w liczniku breakera.

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
| Błędy po wyczerpaniu retry | Ile zadań trafiło do DLQ |
| DLQ fill rate | Ile zadań czeka na ponowne przetworzenie |
| Circuit breaker state | Czy breaker jest zamknięty / otwarty / półotwarty |

```typescript
// Warstwa 2 — log po każdym zadaniu
log.info({ layer: "pipeline", processed, retries, failed, dlqSize, breakerState }, "pipeline stats");
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

#### Warstwa 3 — Zod dla outputu LLM

Projekt używa Zod do walidacji `config.json`. Ten sam wzorzec powinien obowiązywać dla outputu LLM — zamiast ręcznego sprawdzania pól:

```typescript
// src/services/monitor.ts — zamiast ad-hoc if (!output.summary)
import { z } from "zod";
import { config } from "../config.js";

export const SummarySchema = z.object({
  summary: z.string().min(config.monitor.minSummaryLength),
  topics: z.array(z.string()).min(1),
});

export type Summary = z.infer<typeof SummarySchema>;

// w index.ts po otrzymaniu outputu z LLM:
const result = SummarySchema.safeParse(JSON.parse(raw));
if (!result.success) {
  log.warn({ layer: "quality", check: "schema", errors: result.error.issues }, "schema error");
}
```

Zod daje strukturalne błędy walidacji — wiadomo dokładnie, które pole jest nieprawidłowe i dlaczego.

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

**Uwaga: canary kosztuje tokeny.** Wywołanie LLM co minutę tylko po to, żeby sprawdzić czy API działa, to realny overhead. Lepsze podejście: uruchamiać canary raz na N runów lub wyłącznie gdy poprzedni run miał błędy.

```typescript
// Canary co 10 runów lub po błędzie
const shouldRunCanary = runCount % 10 === 0 || lastRunHadErrors;
if (shouldRunCanary) {
  const healthy = await runHealthCheck();
  if (!healthy) { /* pomiń run */ }
}
```

---

## Technika 3: Circuit Breaker (`opossum`)

### Analogia

> Bezpiecznik elektryczny. Gdy prąd jest za duży — wyłącza się automatycznie, chroniąc resztę instalacji.

### Trzy stany

```
[ZAMKNIĘTY] ──── za dużo błędów ───► [OTWARTY]
     ▲                                    │
     │                               po timeoutMs
     │                                    │
[PÓŁOTWARTY] ◄──────────────────────────────
     │
     ├── próba się udała → [ZAMKNIĘTY]
     └── próba się nie udała → [OTWARTY]
```

| Stan | Co się dzieje |
|------|---------------|
| **Zamknięty** | Wszystko działa — żądania przechodzą normalnie |
| **Otwarty** | Usługa pada — żądania blokowane natychmiast, bez czekania na timeout |
| **Półotwarty** | Jedno próbne żądanie — test czy usługa wróciła |

**Dlaczego to ważne w AI?** Każdy provider (OpenAI, Anthropic) miał w ostatnim roku incydenty. Bez circuit breakera — spalasz tokeny na żądania, które *nigdy* się nie powiodą.

**Uwaga:** W AI musisz zdefiniować co to "błąd". Timeout? Jasne. HTTP 500? Jasne. Odpowiedź z kodem 200 zawierająca halucynację? To problem dla walidacji outputu (Warstwa 3).

### Implementacja w `circuit-breaker.ts`

```typescript
import CircuitBreaker from "opossum";
import { config } from "../config.js";

const options = {
  errorThresholdPercentage: config.circuitBreaker.failureThreshold,
  successThreshold: config.circuitBreaker.successThreshold,
  timeout: config.circuitBreaker.timeoutMs,
  resetTimeout: config.circuitBreaker.timeoutMs,
};

export function createLLMBreaker(fn: (...args: unknown[]) => Promise<unknown>) {
  const breaker = new CircuitBreaker(fn, options);

  breaker.on("open",     () => log.error({ layer: "infra", breaker: "open" },       "circuit breaker opened"));
  breaker.on("halfOpen", () => log.warn({ layer: "infra", breaker: "half-open" },   "circuit breaker half-open"));
  breaker.on("close",    () => log.info({ layer: "infra", breaker: "closed" },      "circuit breaker closed"));

  return breaker;
}
```

Circuit breaker **opakowuje pojedyncze wywołanie HTTP** — nie całą funkcję `callLLM` z retry w środku. Retry jest odpowiedzialne za ponawianie prób, circuit breaker za liczenie ich wyników. Gdy breaker jest otwarty — zadanie trafia bezpośrednio do DLQ bez czekania na timeout.

### Który błąd otwiera breaker?

| Błąd | Otwiera breaker? |
|------|-----------------|
| HTTP 500 / timeout | Tak — liczy się do progu |
| HTTP 429 (rate limit) | Tak — zbyt wiele = usługa niedostępna |
| HTTP 400 (zły prompt) | Nie — wina klienta, nie serwera |
| Błąd walidacji JSON | Nie — serwer odpowiedział, wynik był zły |

---

## Technika 4: Dead Letter Queue (`better-sqlite3`)

### Analogia

> Skrzynka "do wyjaśnienia" na poczcie. Paczka, której nie można dostarczyć, nie znika — czeka na ręczne sprawdzenie.

Gdy retry się wyczerpie **i** circuit breaker jest otwarty — dane muszą gdzieś trafić. Bez DLQ te zadania po prostu znikają.

### Schemat tabeli SQLite

| Kolumna | Opis |
|---------|------|
| `id` | Autoinkrementowany klucz |
| `timestamp` | Kiedy zadanie trafiło do DLQ |
| `article_id` | ID artykułu z Hacker News |
| `payload` | Oryginalne dane wejściowe (JSON) |
| `error_type` | Typ błędu (timeout / rate_limit / breaker_open) |
| `attempts` | Liczba prób przed trafieniem do DLQ |
| `status` | `pending` / `reprocessed` / `manual_review` |

### Dwa scenariusze

| Bez DLQ | Z DLQ |
|---------|-------|
| "Straciliśmy dane z 7 dni" | "Mamy kolejkę 7 dni do przetworzenia" |
| Panika, ręczne szukanie w logach | Odpalamy reprocessing, idziemy na kawę |

### Implementacja w `dlq.ts`

```typescript
import Database from "better-sqlite3";
import { log } from "./monitor.js";

const db = new Database("workspace/dlq.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS dead_letter (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp  TEXT    NOT NULL,
    article_id INTEGER NOT NULL,
    payload    TEXT    NOT NULL,
    error_type TEXT    NOT NULL,
    attempts   INTEGER NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'pending'
  )
`);

export function pushToDLQ(articleId: number, payload: unknown, errorType: string, attempts: number) {
  db.prepare(`
    INSERT INTO dead_letter (timestamp, article_id, payload, error_type, attempts)
    VALUES (?, ?, ?, ?, ?)
  `).run(new Date().toISOString(), articleId, JSON.stringify(payload), errorType, attempts);

  log.warn({ layer: "pipeline", dlq: "push", articleId, errorType, attempts }, "pushed to DLQ");
}

export function getDLQSize(): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM dead_letter WHERE status = 'pending'").get() as { count: number };
  return row.count;
}
```

`pushToDLQ()` jest wywoływana w `index.ts` gdy p-retry wyczerpie wszystkie próby lub gdy circuit breaker odrzuci żądanie (stan otwarty).

### Strategia odzyskiwania

**Automatyczny reprocessing na początku każdego runu** — bez ręcznej interwencji.

Kolejność kroków w `index.ts` po zmianie:

```
Run #N → canary check → reprocess DLQ (maks. 3) → fetch nowych artykułów
```

Limit 3 zadania z DLQ per run zapobiega blokowaniu przetwarzania nowych artykułów gdy kolejka urośnie.

```typescript
// src/index.ts — przed fetchArticles()
if (!cliOpts.dryRun && breakerState === "closed") {
  const dlqItems = getDLQPending(config.dlq.reprocessBatchSize); // nie hardcode 3
  for (const item of dlqItems) {
    try {
      await processArticle(item.payload);
      markDLQItem(item.id, "reprocessed");
      log.info({ layer: "pipeline", dlq: "reprocessed", id: item.article_id }, "DLQ item reprocessed");
    } catch {
      markDLQItem(item.id, "manual_review");
      log.warn({ layer: "pipeline", dlq: "manual_review", id: item.article_id }, "DLQ item needs manual review");
    }
  }
}
```

### Przejścia statusów

```
pending → reprocessed     (sukces przy ponownej próbie)
pending → manual_review   (błąd przy ponownej próbie — wymaga ręcznego sprawdzenia)
```

| Status | Znaczenie |
|--------|-----------|
| `pending` | Czeka na ponowne przetworzenie |
| `reprocessed` | Przetworzone pomyślnie |
| `manual_review` | Nie udało się ponownie — wymaga ręcznej interwencji |

**Warunek reprocessingu:** circuit breaker musi być zamknięty. Gdy jest otwarty — DLQ rośnie, ale nie próbujemy ponownie (usługa i tak nie odpowiada). Gdy breaker się zamknie — następny run automatycznie zaczyna nadrabiać zaległości.

**Uwaga: deduplikacja między DLQ a świeżą listą artykułów.** Jeśli artykuł jest w DLQ i jednocześnie wróci do top stories, zostanie przetworzony dwa razy. Normalny fetch pomija go przez `fs.existsSync` (plik już istnieje), ale reprocessing DLQ nie sprawdza tego warunku. Przed reprocessingiem należy sprawdzić, czy plik wyjściowy już istnieje.

**Uwaga: backpressure.** Jeśli DLQ rośnie szybciej niż jest opróżniana, należy spowolnić pobieranie nowych artykułów:

```typescript
if (getDLQSize() > config.dlq.maxSize) {
  log.warn({ layer: "pipeline", dlqSize: getDLQSize() }, "DLQ backpressure — skipping new articles");
  continue;
}
```

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
[services/circuit-breaker.ts]
  breaker zamknięty? ──► TAK ──► [services/llm-client.ts]
        |                          prompts/summarize.md ──► p-retry ──► OpenRouter API
        |                                                         |
        |                                                   sukces / wyczerpano retry
        |                                                         |
        ├── breaker otwarty? ──► TAK ──────────────────────────► |
        |                                                         v
        |                                              [services/dlq.ts]
        |                                               workspace/dlq.db ← nieudane zadania
        |
        v
[services/monitor.ts]
  Warstwa 1: Infrastruktura    (latencja, tokeny, error rate, breaker state)
  Warstwa 2: Pipeline          (throughput, retry rate, DLQ fill rate)
  Warstwa 3: Jakość outputu    (schema, length, canary)
        |
        v
[output: JSON]
  ├── workspace/articles/{timestamp}-{id}.json   ← każdy artykuł osobno
  ├── workspace/dlq.db                           ← nieudane zadania (SQLite)
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

`pino` konfigurujemy z transportem plikowym i formatowaniem przez `pino-pretty`.

**Uwaga: `pino-pretty` w produkcji.** Pretty printing dodaje overhead serializacji. Docelowy setup:
- dev: `pino-pretty` do konsoli
- produkcja: surowy JSON do pliku, parsowany przez zewnętrzne narzędzie (Loki, CloudWatch, grep)

```typescript
// Wykrywanie środowiska przez zmienną
const isDev = process.env.NODE_ENV !== "production";
```



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
| `inquirer` | Interactive menu — numbered options on startup |
| `ora` | Spinner — shows progress during fetch and LLM call |
| `chalk` | Colors — green success, yellow warn, red error |

### 1. Input — interactive menu on startup

After `npm run dev` the user sees a menu and picks an option:

```
AI Workflow — Silent Degradation Demo
======================================

? What do you want to do?
  1) Run normally
  2) Recover articles from DLQ
  3) Simulate retry failure
  4) Simulate monitoring failure (canary check)
  5) Simulate Circuit Breaker failure
  0) Exit
```

| Option | What it does |
|--------|-------------|
| `1` Run normally | Fetch articles, call LLM, save results — standard loop |
| `2` Recover from DLQ | Process all `pending` items from `workspace/dlq.db`, then return to menu |
| `3` Simulate retry failure | Mock API returning HTTP 500 — shows exponential backoff + jitter in console (failed articles are pushed to DLQ), then return to menu |
| `4` Simulate canary failure | Mock LLM returning invalid canary response — shows monitoring alert, then return to menu |
| `5` Simulate Circuit Breaker failure | Mock repeated failures until breaker opens — shows state transitions: closed → open → half-open (rejected articles are pushed to DLQ), then return to menu |
| `0` Exit | Graceful shutdown |

After each task completes, the menu reappears automatically. Pressing Ctrl+C during a task stops the current work gracefully and returns to the menu. The only way to exit the application is option `0`.

Options 3–5 are **simulations** — they mock API responses locally, no real LLM calls, no tokens spent. Their purpose is to show what failure looks like in the console and in `logs/app.log`.

### 2. Input — CLI flags (still available)

Flags can be passed directly to skip the menu, useful for scripting:

```bash
npm run dev                            # show interactive menu
npm run dev -- --articles 5 --once    # run once, 5 articles (skips menu)
npm run dev -- --dry-run              # test fetcher without spending tokens
npm run dev -- --reprocess-dlq        # recover from DLQ and exit
npm run dev -- --help                 # show all options
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
│ Saved to │ workspace/articles/2026-06-08T10-01-00-43821.json │
└─────────────────────────────────────────────────────┘
```

### CLI files in project structure

```
src/
├── utils/
│   ├── cli.ts          ← commander setup, inquirer menu, ora spinners, chalk colors
│   └── simulate.ts     ← mock API responses for options 3–5
```

---

## Stack

| Co | Technologia |
|----|-------------|
| Jezyk | TypeScript (strict mode) |
| LLM API | OpenRouter |
| Runtime | Node.js (tsx) |
| Retry | `p-retry` — Exponential Backoff + Jitter + AbortError |
| Circuit Breaker | `opossum` — 3 stany: zamknięty / otwarty / półotwarty |
| Dead Letter Queue | `better-sqlite3` — tabela `dead_letter` w `workspace/dlq.db` |
| Logging | `pino` + `pino-pretty` — logi do konsoli i `logs/app.log` |
| LLM SDK | `openai` (kompatybilne z OpenRouter) |
| Konfiguracja | `config.json` + `zod` — walidacja przy starcie |
| CLI | `commander` + `inquirer` + `ora` + `chalk` |

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
cd js-ai-aiworkflow-full

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
| `circuitBreaker.failureThreshold` | % failures before breaker opens |
| `circuitBreaker.successThreshold` | Successes in half-open needed to close |
| `circuitBreaker.timeoutMs` | How long breaker stays open before half-open |
| `monitor.minSummaryLength` | Alert if output shorter than N chars |
| `workflow.intervalMs` | How often to run the workflow |
| `workflow.articles` | How many articles to fetch per run |

---

---

## Rozszerzenia i znane pułapki

### Architektura

**`monitor.ts` — podział odpowiedzialności**

`monitor.ts` pełni trzy role: konfiguruje logger (`pino`), uruchamia canary check i waliduje output. Logger powinien być osobnym modułem (`logger.ts`), żeby pozostałe serwisy mogły go importować bez ryzyka circular dependency:

```
src/services/
├── logger.ts         ← tylko pino setup i export log
├── monitor.ts        ← canary check + walidacja outputu (importuje logger.ts)
├── llm-client.ts     ← importuje logger.ts bezpośrednio
└── ...
```

**`simulate.ts` — dependency injection zamiast mocków w kodzie produkcyjnym**

Obecne podejście wstrzykuje mock bezpośrednio do kodu produkcyjnego przez `simulate.ts`. Powoduje to, że kod produkcyjny zawiera logikę testową. Lepszy wzorzec: `callLLM` i `fetchArticles` przyjmują opcjonalny `httpClient` — w testach i symulacjach podajesz mock, w produkcji używasz domyślnego.

```typescript
// zamiast globalnego flaga w simulate.ts
export async function callLLM(text: string, http = defaultHttpClient) { ... }
```

---

### Obserwowalność

**Health endpoint HTTP**

Długo działający workflow powinien być monitorowalny bez czytania logów. Prosty endpoint na `localhost:3001/health` (bez żadnego frameworka — `http.createServer`):

```typescript
import http from "http";

http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      breakerState: breaker.status.stats,
      dlqPending: getDLQSize(),
      lastRunAt: lastRunTimestamp,
      lastRunErrors: lastRunErrorCount,
    }));
  }
}).listen(3001);
```

**Token cost alerting**

Layer 1 loguje tokeny per wywołanie, ale nie ma sumy per run ani alertu gdy koszt skacze:

```typescript
// W monitor.ts — po każdym runie
const tokensThisRun = runMetrics.totalTokens;
const baseline = getBaselineTokens(); // ruchoma średnia z N ostatnich runów
if (tokensThisRun > baseline * 1.5) {
  log.warn({ layer: "infra", tokens: tokensThisRun, baseline }, "token usage spike");
}
```

---

### Utrzymanie danych

**Data retention dla `workspace/articles/`**

Artykuły akumulują się bez końca. Brakuje:
- licznika plików w Layer 2 Pipeline (ile artykułów łącznie w workspace)
- komendy CLI do czyszczenia: `npm run dev -- --cleanup-older-than 7`

```typescript
// Prosta rotacja: usuń pliki starsze niż N dni
const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
fs.readdirSync("workspace/articles")
  .filter(f => fs.statSync(`workspace/articles/${f}`).mtimeMs < cutoff)
  .forEach(f => fs.unlinkSync(`workspace/articles/${f}`));
```

To samo dotyczy wpisów w DLQ ze statusem `reprocessed` lub `manual_review` — rosną bezterminowo.

---

### Odporność

**Multi-model fallback**

OpenRouter obsługuje fallback na inny model gdy primary jest niedostępny. Projekt tego nie wykorzystuje, a to darmowa odporność bez dodatkowej logiki retry:

```json
"model": "anthropic/claude-haiku-4-5",
"modelFallback": "google/gemini-flash-2.0"
```

```typescript
// W llm-client.ts — przy HTTP 503 lub timeout
const model = errorCount > 2 ? config.modelFallback : config.model;
```

---

### Testy

Architektura jest dobrze testowalana — czyste funkcje, config injection, wyraźne granice modułów. Minimum warte pokrycia:

| Test | Co sprawdza |
|------|-------------|
| Circuit breaker state machine | Closed → Open → Half-open → Closed po progach |
| DLQ push/pop/status transitions | `pending → reprocessed`, `pending → manual_review` |
| Canary check z mock LLM | Zwraca `false` gdy output nie pasuje do schematu |
| Zod schema validation | Poprawny i niepoprawny output LLM |
| Retry backoff | Liczba prób i typy błędów, które trafiają do `AbortError` |

---

### Prompt

**`src/prompts/summarize.md` — treść ma znaczenie dla Layer 3**

Dokument opisuje walidację outputu (schema, length, canary), ale nigdy nie pokazuje treści prompta. Prompt musi:
1. Explicite żądać JSON z polami `summary` i `topics`
2. Definiować minimalną długość `summary` (spójność z `config.monitor.minSummaryLength`)
3. Opisywać format `topics` (tablica stringów, nie obiekt, nie string)

Bez tych wymagań w prompcie Layer 3 będzie regularnie zgłaszać błędy schema, które nie są błędem modelu — tylko niedospecyfikowanym promptem.

---

> **One sentence:** Build workflows as if every external call can fail — because sooner or later, it will.

---

> **Podsumowanie jednym zdaniem:** Buduj workflow tak, jakby każde zewnętrzne wywołanie mogło zawieść — bo prędzej czy później zawiedzie.
