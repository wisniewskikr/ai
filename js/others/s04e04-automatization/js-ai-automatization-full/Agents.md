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

Każdy krok, który się nie powiedzie → **głośny alert**.

---

## 6 komponentów bezpieczeństwa

| # | Komponent | Co robi | Jak to działa |
|---|-----------|---------|---------------|
| 1 | **Jawna strefa czasowa** | Nie "domyślna serwera", zawsze `Europe/Warsaw` | `luxon` — `DateTime.now().setZone('Europe/Warsaw')` |
| 2 | **Weryfikacja danych wejściowych** | Dane starsze niż 24h → odmowa + alert | Porównanie timestamp z aktualną godziną |
| 3 | **Walidacja outputu** | Czy odpowiedź AI ma sens? | Sprawdź: JSON parsuje się? Długość > 100 znaków? |
| 4 | **Heartbeat** | Ping po każdym sukcesie | `fetch('https://hc-ping.com/UUID')` na końcu |
| 5 | **Lock file** | Blokada przed nakładaniem się instancji | `proper-lockfile` — druga instancja odpuszcza |
| 6 | **Alert na fail** | Każda odmowa krzyczy | `console.error` + opcjonalny Slack webhook |

---

## Struktura plików

```
src/
  agent.ts        ← główna logika, łączy wszystko
  lock.ts         ← lock file (acquire / release)
  heartbeat.ts    ← ping do healthchecks.io
  validate.ts     ← walidacja inputu i outputu
  alert.ts        ← alert na fail (Slack / console)
.env.example
package.json
tsconfig.json
```

---

## Przykładowy flow (pseudokod)

```typescript
// 1. Jawna strefa czasowa
const now = DateTime.now().setZone('Europe/Warsaw');

// 2. Lock file — czy już działa?
await lock.acquire();

// 3. Weryfikacja danych wejściowych
if (isOlderThan24h(inputData.timestamp)) {
  await alert.send('Dane za stare — odmowa generacji raportu');
  await lock.release();
  process.exit(1);
}

// 4. Wywołanie OpenRouter
const response = await openrouter.chat(prompt);

// 5. Walidacja outputu
if (!isValidOutput(response)) {
  await alert.send('Output niepoprawny — raport nie wysłany');
  await lock.release();
  process.exit(1);
}

// 6. Heartbeat — sukces
await heartbeat.ping();

// 7. Zwolnij lock
await lock.release();
```

---

## Dlaczego TypeScript + OpenRouter?

| Powód | Wyjaśnienie |
|-------|-------------|
| TypeScript | Typy pomagają wyłapać błędy walidacji już na etapie pisania kodu |
| OpenRouter | Jeden klucz API, dostęp do wielu modeli (Claude, GPT, Gemini) — łatwa zamiana modelu |
| Node.js | Naturalny wybór dla cronjobów i prostych agentów HTTP |

---

## Co pokazuje ten demo?

> **Różnica między automatyzacją, której ufasz, a automatyzacją, za którą się modlisz — to te 20 linijek.**
> — Readme-security-pl.md, s04e04

Demo pokazuje, że "działa" to za mało. Agent musi **wiedzieć, że działa** — i **krzyczeć, gdy nie działa**.
