# AGENTS.md — js-ai-access-logviewer

Demo edukacyjne do sekcji **s01e03 — Warunki dostępu agentów AI**.

> Wyobraź sobie agenta AI jak pracownika z przepustką. Każde drzwi, które otworzy — jest zapisane w dzienniku ochrony.

---

## Co to robi?

Agent AI (przez OpenRouter) odpowiada na pytania, wywołując narzędzia. Każda akcja trafia do bazy SQLite z timestampem. Potem możesz przejrzeć co agent robił, kiedy i z jakim wynikiem.

---

## Kluczowe zasady z README (s01e03)

| Zasada | Jak demo to pokazuje |
|--------|----------------------|
| **Audit trail** — "Kto to zobaczy?" | Każda akcja agenta zapisana w SQLite |
| **Read-Only Agent** — Poziom 1 | Narzędzia tylko do odczytu, brak zapisu |
| **Zasada najniższych uprawnień** | Każde narzędzie ma ograniczony, osobny scope |

---

## Stack

| Element | Technologia |
|---------|-------------|
| Język | TypeScript + `tsx` |
| AI | OpenRouter API (`openai/gpt-4o-mini`) |
| SDK | `openai` (compatible z OpenRouter) |
| Baza logów | SQLite via `better-sqlite3` |
| Terminal UI | `chalk` + `cli-table3` |

---

## Struktura projektu

```
src/
  index.ts    — entry point (agent lub viewer)
  agent.ts    — pętla agenta z OpenRouter + tool calling
  tools.ts    — symulowane narzędzia (read-only)
  logger.ts   — zapis każdej akcji do SQLite
  viewer.ts   — przeglądarka logów w terminalu
  db.ts       — inicjalizacja bazy SQLite
db/
  audit.db    — baza logów (gitignored)
.env          — OPENROUTER_API_KEY
```

---

## Narzędzia agenta (tools)

Wszystkie narzędzia sa tylko do odczytu — agent nie moze nic zapisac ani usunac.

| Narzedzie | Co robi | Scope |
|-----------|---------|-------|
| `check_user_access(userId, resource)` | Sprawdza uprawnienia uzytkownika | READ |
| `get_file_metadata(path)` | Zwraca metadane pliku (bez tresci) | READ |
| `list_recent_actions(limit)` | Przeszukuje logi agenta | READ |

---

## Uruchomienie

```bash
# Instalacja
npm install

# Sesja z agentem (zadaj pytanie, agent wywoluje tools)
npm run agent

# Przegladarka logow (pokaz wszystkie akcje)
npm run viewer
```

---

## Zmienne srodowiskowe

| Zmienna | Opis |
|---------|------|
| `OPENROUTER_API_KEY` | Klucz API z openrouter.ai |

---

## Przyklad dzialania

```
[Uzytkownik]: Sprawdz czy user:42 ma dostep do /reports/q4.pdf

[Agent]:  check_user_access("42", "/reports/q4.pdf")
[Agent]:  get_file_metadata("/reports/q4.pdf")

[Viewer]:
Timestamp          | Action             | Input              | Status
-------------------|--------------------|--------------------|---------
2026-05-11 14:23:01| check_user_access  | user:42, q4.pdf   | OK
2026-05-11 14:23:02| get_file_metadata  | /reports/q4.pdf   | OK
```

> Jak dziennik ochrony w biurze — widzisz kto, co, kiedy.

---

## Co to uczy?

- Agent moze miec dostep ograniczony tylko do odczytu
- Kazda akcja powinna byc logowana (audit trail)
- Dzieki logom wiesz co agent robil — nawet jesli cos pojdzie nie tak
