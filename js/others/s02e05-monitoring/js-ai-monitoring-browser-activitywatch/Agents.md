# Window Title Tracker — Privacy First
## Demo edukacyjne: s02e05 — Monitoring Uzytkownikow

### Cel projektu

Pokazac roznice miedzy tradycyjnym monitoringiem a podejsciem Privacy First,
zgodnie z sekcja "Monitoring uzytkownikow" z Readme-security-pl.md.

---

### Zasada Privacy First (z dokumentacji)

```
Tradycyjny tracker          Privacy First
────────────────────────    ────────────────────────
Screenshot co 5s            Odczyt tytulu okna
Analiza na serwerze         Klasyfikacja lokalna
Surowy zapis z trescia      Tylko kategoria + czas
Firma / serwer / haker      Tylko Ty
```

**Przepływ danych:**
```
ActivityWatch API → tytuł + app → klasyfikacja keyword → kategoria → agregat (JSON)
        ↑                  ↑                                               ↑
  lokalny serwer    NIE jest zapisywany                       jedyne co trafia do pliku
```

---

### Kategorie aktywnosci

Klasyfikator sprawdza najpierw pole `app` (nazwa procesu — stabilna, niezalezna od tresci okna), potem `title`. Dzieki temu `app: "Code"` zawsze → `work`, bez wzgledu na to co jest w tytule.

| Kategoria        | Przyklady `app`                          | Przyklady `title`                                    | Slowa kluczowe (app lub title, lowercase)           |
|------------------|------------------------------------------|------------------------------------------------------|-----------------------------------------------------|
| `idle`           | *(AFK — brak aktywnosci)*                | *(nie sprawdzane gdy status == "afk")*               | *(wykrywane przez aw-watcher-afk, nie keyword)*     |
| `work`           | Code, idea64, EXCEL, WINWORD, cursor     | VSCode, IntelliJ, Excel, Word, Cursor, Terminal      | vscode, code, intellij, excel, word, cursor, vim    |
| `communication`  | Slack, Discord, OUTLOOK, thunderbird     | Gmail, Outlook, Slack, Discord, Teams (chat)         | gmail, outlook, slack, discord, teams               |
| `meetings`       | Zoom, whereby, ms-teams                  | Zoom, Google Meet, Webex, Teams (call)               | zoom, meet, webex, whereby                          |
| `browsing`       | chrome, firefox, msedge, brave           | Chrome, Firefox, Edge, Brave (ogólne przeglądanie)   | chrome, firefox, edge, brave, safari                |
| `entertainment`  | Spotify, steam, vlc, Netflix             | YouTube, Netflix, Disney+, Spotify, Twitch, Steam    | youtube, netflix, disney, hbo, spotify, twitch, steam, vimeo |
| `other`          | *(cokolwiek innego)*                     | *(cokolwiek innego)*                                 | *(brak dopasowania keyword → kategoria other)*      |

Klasyfikacja jest w 100% lokalna — keyword-first, bez zewnetrznych wywolan AI.

---

### Prerequisites

Przed uruchomieniem aplikacji muszą działac:

| Wymaganie                  | Jak sprawdzic                                              |
|----------------------------|------------------------------------------------------------|
| ActivityWatch (`aw-server`)| `http://localhost:5600` — serwer HTTP musi odpowiadac      |
| `aw-watcher-window`        | musi byc uruchomiony (tworzy bucket `aw-watcher-window_*`) |
| `aw-watcher-afk`           | musi byc uruchomiony (tworzy bucket `aw-watcher-afk_*`)    |
| Node.js >= 18              | wymagany natywny `fetch` (bez dodatkowych zaleznosci)      |

Jesli `aw-server` nie odpowiada lub brak wymaganego bucketa — aplikacja wyswietla blad z instrukcja i konczy dzialanie (bez crash).

---

### Stack

| Element              | Wybor                                        | Uwagi                                            |
|----------------------|----------------------------------------------|--------------------------------------------------|
| Jezyk                | TypeScript + tsx (runner)                    | bez kompilacji, bezposrednie uruchomienie .ts    |
| Runtime              | Node.js >= 18                                | natywny fetch, bez node-fetch                    |
| Zrodlo danych        | ActivityWatch REST API (lokalny serwer)      | dane nie opuszczaja komputera                    |
| Watcher okna         | `aw-watcher-window` (ActivityWatch)          | natywne sledzenie aktywnego okna, port 5600      |
| Watcher bezczynnosci | `aw-watcher-afk` (ActivityWatch)             | wykrywa AFK → kategoria `idle`                   |
| Klasyfikacja         | keyword-first na `app` + `title` (lokalnie)  | 100% pomiarow bez zewnetrznych wywolan AI        |
| Zapis wynikow        | JSON w katalogu logs/                        | tylko kategorie + czas, bez surowych tytułow     |
| CLI                  | Node.js readline (wbudowany)                 | bez zewnetrznych zaleznosci                      |

**ActivityWatch baseURL:** `http://localhost:5600/api/0` (w `config.json`)
**Brak autentykacji** — ActivityWatch nie wymaga klucza API

---

### Flow aplikacji



Kazde pytanie zawiera opcje wyjscia z aplikacji (`q = quit`).

```
start
  |
  v
Start monitoring? (y = yes | q = quit)
  |
  y
  |
  v
Loop: every 5 seconds
  ├─ GET /api/0/buckets/aw-watcher-afk_*/events?limit=1
  │    └─ jesli status == "afk"  → stats["idle"] += 5s  (skip window check)
  ├─ GET /api/0/buckets/aw-watcher-window_*/events?limit=1  → app + title
  ├─ classifyByKeyword(app, title)   → sprawdz app najpierw, potem title
  └─ stats[category] += 5s

  Every 6 samples (= 30s):
  ├─ print: [Progress] X samples | Y min | Top category: category
  └─ Stop and show statistics? (y = yes | c = continue | q = quit)
         |
         y
         |
         v
  displayStats()   → category table with percentages and bars
  saveStats()      → logs/session-YYYY-MM-DDTHH-MM-SS.json
         |
         v
  What next? (m = new monitoring session | q = quit)
```

#### Pytania i opcje wyjscia

| Moment w aplikacji              | Pytanie na konsoli                                          |
|---------------------------------|-------------------------------------------------------------|
| Start aplikacji                 | `Start monitoring? (y = yes \| q = quit)`                  |
| Po kazdym batchu pomiarow       | `Stop and show statistics? (y = yes \| c = continue \| q = quit)` |
| Po wyswietleniu statystyk       | `What next? (m = new monitoring session \| q = quit)`      |

Wpisanie `q` w dowolnym momencie konczy aplikacje gracefully (sprząta temp pliki, zamyka readline).

---

### ActivityWatch API — szczegoly

ActivityWatch uruchamia lokalny serwer HTTP na porcie 5600. Watchery automatycznie tworza buckety:
- `aw-watcher-window_<hostname>` — aktywne okno
- `aw-watcher-afk_<hostname>` — status bezczynnosci

**Kluczowe endpointy:**
```
GET /api/0/buckets/                              → lista wszystkich bucketow (wykrycie nazw)
GET /api/0/buckets/{bucket_id}/events?limit=1    → najnowszy event
```

**Format eventu window:**
```json
{
  "id": 1234,
  "timestamp": "2026-06-03T10:30:00.000Z",
  "duration": 4.5,
  "data": {
    "app": "Code",
    "title": "index.ts — js-ai-monitoring"
  }
}
```

**Format eventu afk:**
```json
{
  "id": 5678,
  "timestamp": "2026-06-03T10:35:00.000Z",
  "duration": 120.0,
  "data": {
    "status": "afk"
  }
}
```

**Wykrycie bucketa przy starcie:**
1. Pobierz liste ze `/api/0/buckets/`
2. Znajdz bucket pasujacy do `aw-watcher-window_*` — jesli jest kilka, wybierz ten z najpozniejszym `last_updated`
3. Tak samo dla `aw-watcher-afk_*`
4. Jesli brakuje ktoregos — wyswietl blad z instrukcja i zakoncz aplikacje

Na Windows hostname moze zawierac wielkie litery lub znaki specjalne — dopasowanie bucketa powinno byc case-insensitive.

---

### Struktura plikow

```
js-ai-monitoring-browser-activitywatch/
├── src/
│   ├── services/
│   │   ├── activitywatch.ts   ← klient REST API ActivityWatch (pobieranie eventow, wykrycie bucketa)
│   │   ├── classifier.ts      ← keyword-first logic dla wszystkich kategorii
│   │   └── stats.ts           ← statistics display and JSON file saving
│   ├── utils/
│   │   └── cli.ts             ← readline helpers: ask(), sleep(), isYes(), isQuit()
│   └── index.ts               ← main entry point, CLI flow, session loop
├── logs/                      ← session output files (in .gitignore)
├── config.json                ← all config variables (intervals, batch size, activityWatchUrl, etc.)
├── .gitignore                 ← node_modules/, logs/, dist/ (exists)
├── Agents.md                  ← this file
├── package.json
├── tsconfig.json
└── Readme.md                  ← project documentation in English
```

#### config.json (przyklad zawartosci)

```json
{
  "monitoringIntervalMs": 5000,
  "batchSize": 6,
  "activityWatchUrl": "http://localhost:5600/api/0",
  "logsDir": "logs",
  "categories": ["idle", "work", "communication", "meetings", "browsing", "entertainment", "other"]
}
```

Zadna wartosc konfiguracyjna nie jest hardcodowana w kodzie — wszystko pochodzi z `config.json`.

#### Format logow (logs/)

Kazda sesja zapisywana jako JSON. Komunikaty aplikacji na konsoli (poziomy INFO / WARN / ERROR) uzywaja formatu:

```
[YYYY-MM-DD HH:mm:ss] [INFO]  Monitoring started. Interval: 5s | Batch: 6 samples
[YYYY-MM-DD HH:mm:ss] [INFO]  ActivityWatch buckets: aw-watcher-window_hostname, aw-watcher-afk_hostname
[YYYY-MM-DD HH:mm:ss] [INFO]  Sample 6 | Category: browsing | Top: work | Elapsed: 0m 30s
[YYYY-MM-DD HH:mm:ss] [INFO]  Session saved to logs/session-2026-06-03T10-30-00.json
[YYYY-MM-DD HH:mm:ss] [ERROR] ActivityWatch unavailable — is aw-server running on port 5600?
[YYYY-MM-DD HH:mm:ss] [ERROR] Bucket aw-watcher-afk_* not found — is aw-watcher-afk running?
```

---

### Kluczowe decyzje implementacyjne

1. **Struktura src/** — `services/`, `utils/`, `index.ts` zgodnie z wisniewk-app-rules
2. **config.json** — wszystkie zmienne konfiguracyjne (interval, batch, activityWatchUrl, logsDir, categories); zero hardcodowania
3. **ActivityWatch zamiast active-win** — lokalny serwer HTTP, REST API, dane nigdy nie opuszczaja maszyny
4. **ActivityWatch zamiast Ollama** — zero wywolan AI; klasyfikacja keyword-first pokrywa 100% przypadkow lokalnie
5. **AFK detection przez aw-watcher-afk** — kategoria `idle` zamiast nieprawidlowego liczenia bezczynnosci jako pracy
6. **`app` przed `title` w klasyfikatorze** — nazwa procesu stabilniejsza niz tytuł okna; sprawdzamy najpierw `app`, potem `title`
7. **Auto-wykrycie bucketa** — aplikacja sama znajduje `aw-watcher-window_*` i `aw-watcher-afk_*`; przy wielu bucketach wybiera najnowszy (`last_updated`); dopasowanie case-insensitive (Windows hostname)
8. **Fail-fast przy braku AW** — brak serwera lub bucketa = natychmiastowy blad z instrukcja, nie cichy fallback
9. **Batch-based loop** — 6 pomiarow → pauza → pytanie; prostsze niz concurrent readline + loop
10. **Brak zewnetrznych zaleznosci runtime** — natywny `fetch` (Node.js >= 18), zero npm packages w runtime
11. **Quit option at every prompt** — kazde pytanie CLI przyjmuje `q` jako natychmiastowe wyjscie
12. **English UI** — wszystkie komunikaty na konsoli w jezyku angielskim
13. **Log format** — `[YYYY-MM-DD HH:mm:ss] [LEVEL] message` dla INFO / WARN / ERROR
