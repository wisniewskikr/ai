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

## Ograniczenia tej implementacji

> Ten projekt demonstruje **wzorzec architektoniczny**, a nie prawdziwe zabezpieczenie.

Wszystkie trzy "tokeny" w `TokenVault` to aliasy tego samego `OPENROUTER_API_KEY`. Zabezpieczenia są egzekwowane wyłącznie po stronie klienta, w pamięci procesu:

| Mechanizm | Gdzie egzekwowany | Co daje atakującemu klucz |
|-----------|-------------------|---------------------------|
| Scope (model) | tylko w aplikacji | może wywołać dowolny model przez curl |
| TTL | tylko w tej samej sesji | resetuje się przy restarcie procesu |
| Audit log | tylko lokalnie | złodziej klucza nie pozostawi śladu |

OpenRouter nie zna naszych reguł — klucz daje pełen dostęp do konta niezależnie od nich.

### Co projekt realnie wnosi

- **Audit log** — wiesz co i kiedy zostało wywołane
- **Ochrona przed błędem w kodzie** — serwis nie wywoła nieautoryzowanego modelu przez przypadek
- **Separacja odpowiedzialności** — każdy serwis operuje na nazwanym tokenie, nie na surowym kluczu

### Kiedy wzorzec działa naprawdę

Gdy każdy serwis ma **oddzielny klucz z ograniczeniami egzekwowanymi przez dostawcę** (server-side):

```
CHAT_TOKEN     → klucz ograniczony do claude-haiku, wygasa za 5min po stronie serwera
ANALYZER_TOKEN → inny klucz, inne uprawnienia
WRITER_TOKEN   → jeszcze inny klucz
```

Tak działają **HashiCorp Vault**, **AWS Secrets Manager** czy **GCP Secret Manager** — vault wystawia krótkoterminowe, scoped credentials, a serwer egzekwuje ich granice. Dopóki OpenRouter nie wspiera tokenów scoped per model, ten projekt jest demonstracją wzorca, nie gwarancją bezpieczeństwa.

---

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter
- **Zmienna środowiskowa**: `.env` z `OPENROUTER_API_KEY`
