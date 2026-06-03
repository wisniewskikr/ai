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

| Kategoria        | Przyklady tytułow okien                              | Slowa kluczowe (keyword-first)              |
|------------------|------------------------------------------------------|---------------------------------------------|
| `work`           | VSCode, IntelliJ, Excel, Word, Cursor, Terminal      | vscode, intellij, excel, word, cursor, vim  |
| `communication`  | Gmail, Outlook, Slack, Discord, Teams (chat)         | gmail, outlook, slack, discord, teams       |
| `meetings`       | Zoom, Google Meet, Webex, Teams (call)               | zoom, meet, webex, whereby                  |
| `browsing`       | Chrome, Firefox, Edge, Brave (ogólne przeglądanie)   | chrome, firefox, edge, brave, safari        |
| `entertainment`  | YouTube, Netflix, Disney+, HBO Max, Prime Video, Spotify, Twitch, Steam, VLC | youtube, netflix, disney, hbo, prime video, spotify, twitch, steam, vimeo |
| `other`          | wszystko pozostale — nie pasuje do zadnego keyword   | (brak dopasowania keyword → kategoria other) |

Klasyfikacja jest w 100% lokalna — keyword-first, bez zewnetrznych wywolan AI.

---

### Stack

| Element              | Wybor                                        | Uwagi                                            |
|----------------------|----------------------------------------------|--------------------------------------------------|
| Jezyk                | TypeScript + tsx (runner)                    | bez kompilacji, bezposrednie uruchomienie .ts    |
| Zrodlo danych        | ActivityWatch REST API (lokalny serwer)      | dane nie opuszczaja komputera                    |
| Watcher              | `aw-watcher-window` (ActivityWatch)          | natywne sledzenie aktywnego okna, port 5600      |
| Klasyfikacja         | keyword-first (lokalnie, bez AI)             | 100% pomiarow bez zewnetrznych wywolan           |
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
  ├─ GET /api/0/buckets/{bucket}/events?limit=1   → pobierz najnowszy event (app + title)
  ├─ classifyByKeyword(app, title)                → kategoria instant (100% przypadkow)
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

ActivityWatch uruchamia lokalny serwer HTTP na porcie 5600. Watcher `aw-watcher-window` automatycznie tworzy bucket o nazwie `aw-watcher-window_<hostname>`.

**Kluczowe endpointy:**
```
GET /api/0/buckets/                              → lista wszystkich bucketow
GET /api/0/buckets/{bucket_id}/events?limit=1    → najnowszy event aktywnego okna
```

**Format eventu:**
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

**Inicjalizacja:** przy starcie aplikacja odpytuje `/api/0/buckets/` i automatycznie wykrywa bucket `aw-watcher-window_*`. Jesli ActivityWatch nie dziala lub brak bucketa — aplikacja wyswietla blad z instrukcja i konczy dzialanie.

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
  "categories": ["work", "communication", "meetings", "browsing", "entertainment", "other"]
}
```

Zadna wartosc konfiguracyjna nie jest hardcodowana w kodzie — wszystko pochodzi z `config.json`.

#### Format logow (logs/)

Kazda sesja zapisywana jako JSON. Komunikaty aplikacji na konsoli (poziomy INFO / WARN / ERROR) uzywaja formatu:

```
[YYYY-MM-DD HH:mm:ss] [INFO]  Monitoring started. Interval: 5s | Batch: 6 samples
[YYYY-MM-DD HH:mm:ss] [INFO]  ActivityWatch bucket: aw-watcher-window_hostname
[YYYY-MM-DD HH:mm:ss] [INFO]  Sample 6 | Category: browsing | Top: work | Elapsed: 0m 30s
[YYYY-MM-DD HH:mm:ss] [INFO]  Session saved to logs/session-2026-06-03T10-30-00.json
[YYYY-MM-DD HH:mm:ss] [ERROR] ActivityWatch unavailable — is aw-watcher-window running?
```

---

### Kluczowe decyzje implementacyjne

1. **Struktura src/** — `services/`, `utils/`, `index.ts` zgodnie z wisniewk-app-rules
2. **config.json** — wszystkie zmienne konfiguracyjne (interval, batch, activityWatchUrl, logsDir, categories); zero hardcodowania
3. **ActivityWatch zamiast active-win** — lokalny serwer HTTP, REST API, dane nigdy nie opuszczaja maszyny
4. **ActivityWatch zamiast Ollama** — zero wywolan AI; klasyfikacja keyword-first pokrywa 100% przypadkow lokalnie
5. **Keyword-first dla wszystkich kategorii** — brak zaleznosci od zewnetrznych modeli; `other` to po prostu brak dopasowania
6. **Auto-wykrycie bucketa** — aplikacja sama znajduje `aw-watcher-window_*` bucket bez konfiguracji hostname
7. **Batch-based loop** — 6 pomiarow → pauza → pytanie; prostsze niz concurrent readline + loop
8. **Brak zewnetrznych zaleznosci runtime** — tylko wbudowane Node.js modules + `node-fetch` lub natywny `fetch` (Node 18+)
9. **Quit option at every prompt** — kazde pytanie CLI przyjmuje `q` jako natychmiastowe wyjscie
10. **English UI** — wszystkie komunikaty na konsoli w jezyku angielskim
11. **Log format** — `[YYYY-MM-DD HH:mm:ss] [LEVEL] message` dla INFO / WARN / ERROR
