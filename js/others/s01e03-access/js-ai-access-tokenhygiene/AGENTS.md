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
proxy/
  server.ts          — lokalny proxy: klucze, scope, audit log w SQLite
src/
  prompts/           — prompt builders (edytowalne bez zmiany logiki)
  services/
    token-vault.ts   — TokenVault: in-process TTL, scope, audit log
    chat-agent.ts    — serwis chat (CHAT_API_KEY)
    analyzer.ts      — serwis analizy (ANALYZER_API_KEY)
    writer.ts        — serwis pisania (WRITER_API_KEY)
  utils/
    config.ts        — loader config.json
    logger.ts        — zapis logów do pliku i konsoli
    openrouter.ts    — wywołanie lokalnego proxy
  index.ts           — demo: bad pattern vs good pattern
  setup-keys.ts      — tworzy wirtualne klucze przez proxy API
proxy.db             — SQLite: wirtualne klucze + audit log (git-ignored)
config.json          — wszystkie zmienne konfiguracyjne
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

## Lokalny proxy — prawdziwa separacja kluczy

Proxy siedzi między serwisami a OpenRouter. Serwisy nigdy nie widzą klucza OpenRouter — dostają tylko wirtualne klucze wystawione przez proxy.

```
ChatAgent    → CHAT_API_KEY     ──┐
Analyzer     → ANALYZER_API_KEY ──┤──► Local Proxy ──► OpenRouter
Writer       → WRITER_API_KEY   ──┘        ↑
                                   OPENROUTER_API_KEY (tylko tu)
```

Scope jest egzekwowany **server-side** — wirtualny klucz ChatAgenta nie wywoła `claude-sonnet`, bo proxy odrzuci żądanie zanim dotrze do OpenRouter.

### Jak działa

Proxy przy każdym żądaniu:

1. Sprawdza czy wirtualny klucz istnieje w SQLite
2. Sprawdza czy TTL nie wygasł
3. Sprawdza czy model jest w `allowedModels`
4. Podmienia klucz na prawdziwy i przekazuje do OpenRouter
5. Zapisuje audit log do SQLite

### Schemat bazy (SQLite, plik `proxy.db`)

```sql
CREATE TABLE virtual_keys (
  key        TEXT PRIMARY KEY,
  service    TEXT NOT NULL,
  models     TEXT NOT NULL,  -- JSON array, np. '["claude-haiku-4-5"]'
  expires_at INTEGER,        -- Unix timestamp, NULL = nie wygasa
  created_at INTEGER NOT NULL
);

CREATE TABLE audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  key        TEXT NOT NULL,
  service    TEXT NOT NULL,
  model      TEXT NOT NULL,
  tokens     INTEGER,
  ts         INTEGER NOT NULL
);
```

### Stack

| | |
|---|---|
| `express` | serwer HTTP |
| `node:sqlite` | SQLite wbudowany w Node.js 22.5+ (zero kompilacji natywnej) |
| `node:crypto` | generowanie wirtualnych kluczy |

### Uruchomienie

```bash
npm install
npm run proxy          # startuje proxy na localhost:4000
npm run setup-keys     # tworzy wirtualne klucze, wypisuje je do wklejenia w .env
npm run dev            # uruchamia demo
```

### Zmienne środowiskowe

| Zmienna | Kto jej używa |
|---------|--------------|
| `OPENROUTER_API_KEY` | tylko lokalny proxy |
| `PROXY_ADMIN_KEY` | Hasło admina lokalnego proxy — chroni `POST /key/generate` (tworzenie/usuwanie wirtualnych kluczy) |
| `CHAT_API_KEY` | ChatAgent (scope: claude-haiku-4-5) |
| `ANALYZER_API_KEY` | Analyzer (scope: claude-haiku-4-5) |
| `WRITER_API_KEY` | Writer (scope: claude-sonnet-4-6) |

---

## Ograniczenia tej implementacji

> Ten projekt demonstruje **wzorzec architektoniczny** z realnym server-side TTL i scope — ale egzekucja odbywa się w lokalnym proxy, nie po stronie OpenRouter.

Wirtualne klucze wydawane przez proxy są osobnymi tokenami — każdy serwis dostaje inny klucz. Lokalny proxy egzekwuje scope i TTL server-side przed przekazaniem żądania do OpenRouter:

| Mechanizm | Gdzie egzekwowany | Co daje atakującemu wirtualny klucz |
|-----------|-------------------|--------------------------------------|
| Scope (model) | **proxy server-side** | może wywołać tylko dozwolony model |
| TTL | **proxy server-side (SQLite)** | klucz wygasa, proxy zwraca 401 |
| Audit log | proxy (SQLite) | każde żądanie zapisane w bazie |

Ograniczenie: jeśli atakujący zna `OPENROUTER_API_KEY` (przechowywany tylko w proxy), omija wszystkie reguły. Wirtualne klucze serwisów nie dają dostępu do OpenRouter bezpośrednio.

### Co projekt realnie wnosi

- **Server-side TTL** — klucz wygasa w SQLite, restart procesu nie resetuje TTL
- **Server-side scope** — proxy odrzuca nieautoryzowany model zanim dotrze do OpenRouter
- **Audit log** — każde żądanie zapisane z timestampem, service, model i tokenami
- **Separacja kluczy** — wyciek `CHAT_API_KEY` nie daje dostępu do modeli Writera

### Kiedy wzorzec działa naprawdę

Gdy każdy serwis ma **oddzielny klucz z ograniczeniami egzekwowanymi przez dostawcę** (server-side):

```
CHAT_TOKEN     → klucz ograniczony do claude-haiku, wygasa za 5min po stronie serwera
ANALYZER_TOKEN → inny klucz, inne uprawnienia
WRITER_TOKEN   → jeszcze inny klucz
```

Tak działają **HashiCorp Vault**, **AWS Secrets Manager** czy **GCP Secret Manager** — vault wystawia krótkoterminowe, scoped credentials, a serwer egzekwuje ich granice. Ten projekt implementuje ten sam wzorzec lokalnie — bez zewnętrznych zależności.

---

## Stack

- **Runtime**: Node.js + TypeScript
- **AI API**: OpenRouter (przez lokalny proxy)
- **Proxy**: Express + `node:sqlite` — bez Pythona, bez Dockera, bez zewnętrznej bazy
- **Konfiguracja**: `config.json` — wszystkie zmienne w jednym miejscu
- **Sekrety**: `.env` — klucze API, nigdy w kodzie
