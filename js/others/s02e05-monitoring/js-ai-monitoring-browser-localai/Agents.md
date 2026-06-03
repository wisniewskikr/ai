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
Analiza na serwerze         Klasyfikacja przez AI
Surowy zapis z trescia      Tylko kategoria + czas
Firma / serwer / haker      Tylko Ty
```

**Przepływ danych:**
```
Aktywne okno → tytuł → AI (Ollama, lokalnie) → kategoria → agregat (JSON)
                ↑                                                ↑
         NIE jest zapisywany                        jedyne co trafia do pliku
```

---

### Kategorie aktywnosci (z README)

| Kategoria       | Przyklad tytulu okna            |
|-----------------|---------------------------------|
| programowanie   | VSCode — main.ts                |
| komunikacja     | Gmail, Slack, Discord           |
| spotkania       | Zoom, Google Meet               |
| dokumentacja    | Notion, Word, Confluence        |
| przegladanie    | Chrome, Firefox, Edge           |
| multimedia      | Spotify, YouTube, VLC           |
| inne            | wszystko pozostale              |

---

### Stack

| Element              | Wybor                                        | Uwagi                                          |
|----------------------|----------------------------------------------|------------------------------------------------|
| Jezyk                | TypeScript + tsx (runner)                    | bez kompilacji, bezposrednie uruchomienie .ts  |
| AI klasyfikacja      | Ollama (lokalny serwer, OpenAI-compatible)   | dane nie opuszczaja komputera                  |
| Model                | `llama3.2:3b`                                | ~2 GB RAM, szybki, wystarczajacy do klasyfikacji |
| Odczyt okna (Win)    | PowerShell + Win32 API (GetForegroundWindow) | .ps1 zapisywany do tmpdir na starcie           |
| Zapis wynikow        | JSON w katalogu logs/                        | tylko kategorie + czas, bez surowych tytułow   |
| CLI                  | Node.js readline (wbudowany)                 | bez zewnetrznych zaleznosci                    |

**Ollama baseURL:** `http://localhost:11434/v1` (w `config.json`)
**Brak klucza API** — Ollama nie wymaga autentykacji; `apiKey` ustawione na `"ollama"`

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
  ├─ getActiveWindowTitle()      → raw title (temporary, NOT saved)
  ├─ classifyWindow(title)       → category (via AI or keyword fallback)
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

### Struktura plikow

```
js-ai-monitoring-browser-localai/
├── src/
│   ├── prompts/
│   │   └── classify.ts        ← system prompt for window title classification
│   ├── services/
│   │   ├── classifier.ts      ← AI classification logic (Ollama call + keyword fallback)
│   │   ├── monitor.ts         ← active window title reading (PowerShell / Win32)
│   │   └── stats.ts           ← statistics display and JSON file saving
│   ├── utils/
│   │   └── cli.ts             ← readline helpers: ask(), sleep(), isYes(), isQuit()
│   └── index.ts               ← main entry point, CLI flow, session loop
├── logs/                      ← session output files (in .gitignore)
├── config.json                ← all config variables (intervals, batch size, model, etc.)
├── .env                       ← (exists; Ollama nie wymaga klucza API)
├── .env.example               ← env variable template
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
  "ollamaBaseUrl": "http://localhost:11434/v1",
  "model": "llama3.2:3b",
  "logsDir": "logs"
}
```

Zadna wartosc konfiguracyjna nie jest hardcodowana w kodzie — wszystko pochodzi z `config.json`.

#### Format logow (logs/)

Kazda sesja zapisywana jako JSON. Komunikaty aplikacji na konsoli (poziomy INFO / WARN / ERROR) uzywaja formatu:

```
[YYYY-MM-DD HH:mm:ss] [INFO]  Monitoring started. Interval: 5s | Batch: 6 samples
[YYYY-MM-DD HH:mm:ss] [INFO]  Sample 6 | Category: browsing | Top: coding | Elapsed: 0m 30s
[YYYY-MM-DD HH:mm:ss] [INFO]  Session saved to logs/session-2026-06-03T10-30-00.json
[YYYY-MM-DD HH:mm:ss] [ERROR] AI classification failed — using keyword fallback
```

---

### Kluczowe decyzje implementacyjne

1. **Struktura src/** — `prompts/`, `services/`, `utils/`, `index.ts` zgodnie z wisniewk-app-rules
2. **config.json** — wszystkie zmienne konfiguracyjne (interval, batch, model, logsDir); zero hardcodowania
3. **Batch-based loop** — 6 pomiarow → pauza → pytanie; prostsze niz concurrent readline + loop
4. **Fallback bez AI** — classifyByKeyword() w classifier.ts działa gdy brak klucza/połączenia
5. **Temp PS1 script** — zapisywany raz na starcie do `os.tmpdir()`, unika escaping hell
6. **Brak dotenv package** — czytamy .env recznie (redukcja zaleznosci)
7. **Zero external deps w runtime** — tylko `openai` package (kompatybilny z Ollama API)
8. **Quit option at every prompt** — kazde pytanie CLI przyjmuje `q` jako natychmiastowe wyjscie
9. **English UI** — wszystkie komunikaty na konsoli w jezyku angielskim (naglowki, progress, pytania, statystyki)
10. **Log format** — `[YYYY-MM-DD HH:mm:ss] [LEVEL] message` dla INFO / WARN / ERROR

---

### Uwagi edukacyjne do omowienia

- **Dlaczego Ollama, nie OpenRouter?** — Dane w ogole nie opuszczaja komputera. To wzmacnia
  argument Privacy First: nie tylko nie zapisujemy tresci okien, ale AI dziala w 100% lokalnie.
- **Dlaczego nie screenshot?** — Screenshoty to inwigilacja (Amazon: kara 32M EUR).
  Tytuł okna to minimalny zbior danych zgodny z RODO.
- **Agregat vs surowe dane** — pokazac roznice: `Gmail — negocjacje — 23 min` vs `komunikacja — 23 min`
- **RODO** — pracodawca moze monitorowac kategorie, ale NIE treść.
