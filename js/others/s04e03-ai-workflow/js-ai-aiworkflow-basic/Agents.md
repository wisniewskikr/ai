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

**Scenariusz:** Co minutę pobieramy tekst artykułu, wysyłamy do LLM przez OpenRouter i dostajemy podsumowanie w JSON.

**Dlaczego to dobre demo?**

- Prosto — jedno wywołanie LLM, jeden JSON na wyjściu
- Realnie — takie workflow naprawdę się psują w ciszy
- Widocznie — wszystkie awarie i metryki widać w konsoli

---

## Struktura projektu

```
js-ai-aiworkflow-basic/
├── src/
│   ├── index.ts          # punkt wejścia, uruchamia workflow w pętli
│   ├── llm-client.ts     # wywołanie OpenRouter z retry
│   ├── retry.ts          # Exponential Backoff + Jitter
│   └── monitor.ts        # 3 warstwy monitoringu
├── .env.example
├── package.json
└── Agents.md
```

---

## Technika 1: Retry z Exponential Backoff + Jitter

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

Jitter rozkłada ruch losowo: każda instancja czeka `random(0, base_delay)` sekund.

### Które błędy retryować?

| Błąd | Retry? | Dlaczego |
|------|--------|----------|
| HTTP 429 (rate limit) | Tak, z dłuższą przerwą | Serwer prosi o chwilę |
| HTTP 500 (błąd serwera) | Tak | Przejściowy problem |
| Timeout | Tak | Może być chwilowa przeciążenie |
| HTTP 400 (zły prompt) | Nie | Prompt się nie naprawi sam |

### Implementacja w `retry.ts`

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 4,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      // Exponential Backoff
      const exponential = baseDelayMs * Math.pow(2, attempt - 1);

      // Jitter — "decorrelated" (polecany przez AWS)
      const jitter = Math.random() * exponential;
      const delay = Math.floor(exponential + jitter);

      console.log(`[RETRY] Próba ${attempt}/${maxAttempts}. Czekam ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw new Error("Unreachable");
}
```

---

## Technika 2: Monitoring (3 warstwy)

### Analogia

> Klasyczny monitoring pyta: "Czy serwer żyje?". Monitoring AI pyta też: "Czy wynik ma sens?".

### Warstwa 1: Infrastruktura

*Czy serwis w ogóle odpowiada?*

| Metryka | Co mierzymy |
|---------|-------------|
| Uptime | Czy API OpenRouter odpowiada |
| HTTP error rate | Ile % wywołań kończy się błędem |
| Latencja | Czas odpowiedzi w ms |
| Rate limit hits | Ile razy dostaliśmy 429 |

```typescript
// monitor.ts — Warstwa 1
infra: {
  totalCalls: number;
  errorRate: number;      // błędy / totalCalls
  avgLatencyMs: number;
  rateLimitHits: number;
}
```

### Warstwa 2: Pipeline

*Czy dane przepływają?*

| Metryka | Co mierzymy |
|---------|-------------|
| Throughput | Ile zadań przetworzyliśmy na minutę |
| Retry rate | Ile % wywołań wymagało retry |
| Błędy po wyczerpaniu retry | Ile zadań "przepadło" |

```typescript
// monitor.ts — Warstwa 2
pipeline: {
  processedPerMinute: number;
  retryRate: number;      // retry / totalCalls
  failedPermanently: number;
}
```

### Warstwa 3: Jakość outputu

*Czy wynik ma sens?*

| Kontrola | Co sprawdzamy | Alert gdy |
|----------|---------------|-----------|
| Schema validation | Czy JSON ma pola `summary`, `topics` | Brak pola |
| Length test | Czy podsumowanie ma > 50 znaków | Za krótkie = halucynacja |
| Canary check | Co 5 wywołań — testowe zdanie z oczekiwanym outputem | Inny wynik niż baseline |

```typescript
// monitor.ts — Warstwa 3
quality: {
  schemaErrorRate: number;  // błędy schema / totalCalls
  lengthAlerts: number;     // outputy poniżej progu
  canaryFailures: number;   // nieudane testy canary
}
```

---

## Jak to działa razem — przepływ danych

```
[input: tekst artykułu]
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

```
[INFRA]    latencja: 342ms | error rate: 0%
[RETRY]    Próba 2/4. Czekam 1847ms... (HTTP 429)
[RETRY]    Próba 3/4. Czekam 3214ms... (HTTP 429)
[PIPELINE] throughput: 12 zadań/min | retry rate: 16%
[QUALITY]  schema OK | length OK | canary OK
[ALERT]    schema error rate > 5% — sprawdz model!
```

---

## Stack

| Co | Technologia |
|----|-------------|
| Jezyk | TypeScript |
| LLM API | OpenRouter |
| Runtime | Node.js (tsx) |
| Zaleznosci | tylko `openai` SDK (kompatybilne z OpenRouter) |

Brak zewnętrznych bibliotek do retry ani monitoringu — wszystko implementujemy od zera, żeby zrozumieć mechanizm.

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
