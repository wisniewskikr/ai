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

**Fallback — mock lokalny**

Jeśli HN API nie odpowiada (test offline, CI), `news-fetcher.ts` zwraca listę 5 przykładowych artykułów z pliku `mock-articles.ts`. Retry i monitoring działają identycznie.

---

## Struktura projektu

```
js-ai-aiworkflow-basic/
├── src/
│   ├── index.ts            # punkt wejścia, uruchamia workflow w pętli
│   ├── news-fetcher.ts     # pobiera artykuły z Hacker News API
│   ├── mock-articles.ts    # fallback — lokalne dane testowe
│   ├── llm-client.ts       # wywołanie OpenRouter z p-retry
│   └── monitor.ts          # 3 warstwy monitoringu (pino)
├── .env.example
├── package.json
└── Agents.md
```

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
      const res = await openai.chat.completions.create({ ... });
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

```typescript
// Warstwa 1 — log po każdym wywołaniu
log.info({ layer: "infra", latencyMs, status: res.status }, "llm call");
log.error({ layer: "infra", status: 429 }, "rate limit hit");
```

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
| Canary check | Co 5 wywołań — testowe zdanie z oczekiwanym outputem | Inny wynik niż baseline |

```typescript
// Warstwa 3 — log po walidacji outputu
log.warn({ layer: "quality", check: "schema", field: "topics" }, "schema error");
log.warn({ layer: "quality", check: "length", chars: 12 }, "output too short");
log.error({ layer: "quality", check: "canary" }, "canary failed");
```

---

## Jak to działa razem — przepływ danych

```
[news-fetcher.ts]
  Hacker News API
  └── fallback: mock-articles.ts
        |
        v
[input: title + text artykułu]
        |
        v
[llm-client.ts]
  └── withRetry() ──► OpenRouter API
        |                    |
        |              sukces / błąd
        |                    |
        v                    v
[monitor.ts]          [retry.ts]
  Warstwa 1           Exponential
  Warstwa 2           Backoff +
  Warstwa 3           Jitter
        |
        v
[output: JSON] lub [alert w konsoli]
```

---

## Co zobaczysz w konsoli

`pino` wypisuje JSON — jeden rekord na linię:

```
{"level":30,"layer":"infra","latencyMs":342,"status":200,"msg":"llm call"}
{"level":40,"layer":"infra","attempt":2,"error":"rate limit","msg":"retry"}
{"level":40,"layer":"infra","attempt":3,"error":"rate limit","msg":"retry"}
{"level":30,"layer":"pipeline","processed":12,"retries":2,"failed":0,"msg":"pipeline stats"}
{"level":30,"layer":"quality","check":"schema","msg":"schema ok"}
{"level":50,"layer":"quality","check":"canary","msg":"canary failed"}
```

Poziomy logów `pino`: `10` trace · `20` debug · `30` info · `40` warn · `50` error · `60` fatal

---

## Stack

| Co | Technologia |
|----|-------------|
| Jezyk | TypeScript |
| LLM API | OpenRouter |
| Runtime | Node.js (tsx) |
| Retry | `p-retry` — Exponential Backoff + Jitter + AbortError |
| Logging | `pino` — strukturalne logi JSON |
| LLM SDK | `openai` (kompatybilne z OpenRouter) |

---

## Jak uruchomić

```bash
cp .env.example .env
# Dodaj OPENROUTER_API_KEY do .env

npm install
npm run dev
```

---

> **Podsumowanie jednym zdaniem:** Buduj workflow tak, jakby każde zewnętrzne wywołanie mogło zawieść — bo prędzej czy później zawiedzie.
