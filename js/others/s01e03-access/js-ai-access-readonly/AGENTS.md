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
| Baza danych | `node:sqlite` (wbudowany w Node.js 22+, tryb `readonly: true`) |
| AI | OpenRouter API (przez `openai` SDK) |
| Zmienne środowiskowe | `dotenv` + `.env` |
| Język aplikacji | tylko angielski |

### Struktura plików

```
src/
  prompts/
    system.ts — prompt systemowy agenta (edytowalny bez zmiany logiki)
  db.ts       — baza SQLite, otwarta tylko do odczytu
  tools.ts    — narzędzia agenta: tylko SELECT (list/search/get)
  agent.ts    — agent OpenRouter z read-only toolami
  audit.ts    — zapis każdej akcji do logs/audit.log z timestampem
  index.ts    — interaktywne menu + scenariusze demo
logs/
  audit.log   — tworzony automatycznie przy pierwszym uruchomieniu
config.json   — model, ścieżki, ustawienia agenta
package.json
tsconfig.json
.env.example
README.md
```

---

## Menu interaktywne

Aplikacja wyświetla w terminalu numerowane menu (wszystkie teksty po angielsku):

```
=== Read-Only Agent Demo ===

1. Create — Add a new product       [blocked — no write access]
2. Read   — List / search products  [allowed]
3. Update — Change product price    [blocked — no write access]
4. Delete — Remove a product        [blocked — no write access]
5. Custom — Type your own task
6. Exit

Choose an option (1-6):
```

| Opcja | Akcja | Wynik | Dlaczego? |
|-------|-------|-------|-----------|
| 1 | Create — "Add product: Laptop, 2999 PLN" | zablokowane | agent nie ma narzędzia zapisu |
| 2 | Read — "List all products" | sukces | agent ma narzędzie `list_products` |
| 3 | Update — "Change price of Laptop to 1999 PLN" | zablokowane | agent nie ma narzędzia zapisu |
| 4 | Delete — "Remove product: Laptop" | zablokowane | agent nie ma narzędzia zapisu |
| 5 | Custom — użytkownik wpisuje własne zadanie | zależy od zadania | |
| 6 | Exit — wyjście z aplikacji | — | — |

---

## Kluczowe zasady (z Readme-security-pl.md / s01e03)

| Zasada | Jak pokazujemy w kodzie |
|--------|------------------------|
| Zasada najniższych uprawnień | agent dostaje tylko 3 narzędzia READ, żadnych WRITE |
| Poziom 1 — Read Only | SQLite otwarte z `{ readonly: true }` |
| Audit trail | każde wywołanie narzędzia zapisane do `audit.log` z timestampem |
| Higiena tokenów | klucz API tylko w `.env`, nigdy w kodzie |

---

## Uruchomienie

```bash
npm install
cp .env.example .env   # uzupełnij OPENROUTER_API_KEY
npm run dev
```
