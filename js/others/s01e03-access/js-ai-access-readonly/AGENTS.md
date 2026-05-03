# AGENTS.md — Read-Only Agent Demo

## Co to jest?

Agent AI, który **może tylko czytać** dane. Jak bibliotekarz — może Ci pokazać książkę, ale nie może jej wyrzucić ani przepisać.

## Cel projektu

Pokazać **Poziom 1 — Read Only** z zasad bezpieczeństwa agentów AI (s01e03).

---

## Ustalenia

### Stack

| Co | Czym |
|----|------|
| Język | TypeScript |
| Uruchomienie | `tsx` |
| Baza danych | `better-sqlite3` (tryb `readonly: true`) |
| AI | OpenRouter API (przez `openai` SDK) |
| Zmienne środowiskowe | `dotenv` + `.env` |

### Struktura plików

```
src/
  db.ts       — baza SQLite, otwarta tylko do odczytu
  tools.ts    — narzędzia agenta: tylko SELECT (list/search/get)
  agent.ts    — agent OpenRouter z read-only toolami
  audit.ts    — zapis każdej akcji do audit.log
  index.ts    — demo: 4 scenariusze
package.json
tsconfig.json
.env.example
README.md
```

---

## Scenariusze demo

| # | Zapytanie | Wynik | Dlaczego? |
|---|-----------|-------|-----------|
| 1 | "Pokaż wszystkie produkty" | sukces | agent ma narzędzie `list_products` |
| 2 | "Znajdź produkty poniżej 50 PLN" | sukces | agent ma narzędzie `search_products` |
| 3 | "Zmień cenę produktu na 99 PLN" | zablokowane | brak narzędzia zapisu |
| 4 | "Usuń produkt" | zablokowane | brak narzędzia zapisu |

---

## Kluczowe zasady (z Readme-security-pl.md / s01e03)

| Zasada | Jak pokazujemy w kodzie |
|--------|------------------------|
| Zasada najniższych uprawnień | agent dostaje tylko 3 narzędzia READ, żadnych WRITE |
| Poziom 1 — Read Only | SQLite otwarte z `{ readonly: true }` |
| Audit trail | każde wywołanie narzędzia zapisane do `audit.log` z timestampem |
| Higiena tokenów | klucz API tylko w `.env`, nigdy w kodzie |

---

## Uruchomienie (plan)

```bash
npm install
cp .env.example .env   # uzupełnij OPENROUTER_API_KEY
npm run dev
```
