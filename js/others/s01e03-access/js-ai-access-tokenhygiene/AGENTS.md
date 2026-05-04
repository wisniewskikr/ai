# Token Hygiene Demo

> Token to jak klucz do drzwi. Jeden klucz do wszystkich drzwi = ogromne ryzyko.
> Ten projekt pokazuje jak to robić dobrze — i jak to wygląda, gdy robimy to źle.

---

## Co ten projekt pokazuje

Porównanie dwóch podejść do zarządzania tokenami API w agencie AI:

| | Bad pattern | Good pattern |
|---|---|---|
| Tokeny | Jeden do wszystkiego | Osobny na każdy serwis |
| Zakres | Brak ograniczeń | Tylko dozwolone modele |
| Ważność | Nie wygasa | TTL w minutach |
| Logowanie | Brak | Audit log każdej akcji |

---

## Struktura projektu

```
src/
  token-vault.ts   — TokenVault: klasa zarządzająca tokenami
  services.ts      — 3 serwisy AI, każdy ze swoim tokenem
  index.ts         — demo: bad pattern vs good pattern
```

---

## Jak to działa

### TokenVault — sejf na klucze

Analogia: skrytki w banku. Każdy serwis dostaje osobną skrytkę, do której pasuje tylko jego klucz.

Każdy token ma:

| Parametr | Opis | Przykład |
|----------|------|---------|
| `scope` | Lista dozwolonych modeli | `["claude-haiku-4-5"]` |
| `expiresIn` | Czas życia tokenu | `5` (minut) |
| audit log | Zapis każdego użycia | `timestamp + model + tokeny` |

### 3 serwisy AI

| Serwis | Token | Dozwolony model | TTL |
|--------|-------|-----------------|-----|
| ChatAgent | `CHAT_TOKEN` | `claude-haiku-4-5` | 5 min |
| Analyzer | `ANALYZER_TOKEN` | `claude-haiku-4-5` | 2 min |
| Writer | `WRITER_TOKEN` | `claude-sonnet-4-6` | 10 min |

---

## Przykładowy output

```
=== BAD PATTERN ===
[chat]     Używa: sk-or-v1-e204... (pełny klucz, bez ograniczeń)
[analyzer] Używa: sk-or-v1-e204... (ten sam klucz, ten sam scope)
[writer]   Używa: sk-or-v1-e204... (brak audytu, brak expiry)

=== GOOD PATTERN ===
[chat]     Token: CHAT_TOKEN     | scope: claude-haiku-4-5  | TTL: 5min
[analyzer] Token: ANALYZER_TOKEN | scope: claude-haiku-4-5  | TTL: 2min
[writer]   Token: WRITER_TOKEN   | scope: claude-sonnet-4-6 | TTL: 10min

AUDIT LOG:
2026-05-04 12:00:01 | chat     | claude-haiku-4-5  | 142 tokens
2026-05-04 12:00:02 | analyzer | claude-haiku-4-5  |  89 tokens
2026-05-04 12:00:03 | writer   | claude-sonnet-4-6 | 201 tokens

=== SCOPE VIOLATION TEST ===
[analyzer] próba użycia claude-opus-4-6...
ERROR: ScopeViolationError — model 'claude-opus-4-6' not in scope for 'analyzer'

=== TOKEN EXPIRY TEST ===
[analyzer] próba użycia po wygaśnięciu TTL...
ERROR: TokenExpiredError — token 'ANALYZER_TOKEN' wygasł 3 minuty temu
```

---

## Zasady higieny tokenów (z dokumentu)

| Zasada | Co robić |
|--------|----------|
| Nie dawaj jednego tokena do wszystkiego | Osobny token na każdy serwis z ograniczonym zakresem |
| Rotuj tokeny | Krótkie TTL (5 min zamiast 24h) = 92% mniejsze ryzyko kradzieży |
| Przechowuj sekrety w sejfach | Tokeny w `.env`, nigdy w kodzie źródłowym |

> **Nigdy** nie wrzucaj tokenów do kodu, promptów ani plików konfiguracyjnych w repozytorium.

---

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter
- **Zmienna środowiskowa**: `.env` z `OPENROUTER_API_KEY`
