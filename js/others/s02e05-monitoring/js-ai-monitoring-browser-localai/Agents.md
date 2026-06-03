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
Aktywne okno → tytuł → AI (OpenRouter) → kategoria → agregat (JSON)
                ↑                                         ↑
         NIE jest zapisywany                     jedyne co trafia do pliku
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

| Element              | Wybor                                      | Uwagi                                         |
|----------------------|--------------------------------------------|-----------------------------------------------|
| Jezyk                | TypeScript + tsx (runner)                  | bez kompilacji, bezposrednie uruchomienie .ts |
| AI klasyfikacja      | OpenRouter (free model)                    | zamiast Ollama — latwiejszy setup             |
| Model domyslny       | meta-llama/llama-3.2-3b-instruct:free      | darmowy, wystarczajacy do klasyfikacji        |
| Odczyt okna (Win)    | PowerShell + Win32 API (GetForegroundWindow) | .ps1 zapisywany do tmpdir na starcie        |
| Zapis wynikow        | JSON w katalogu logs/                      | tylko kategorie + czas, bez surowych tytułow |
| CLI                  | Node.js readline (wbudowany)               | bez zewnetrznych zaleznosci                  |

**Zmienna srodowiskowa:** `OPENROUTER_API_KEY` (w `.env`)
**Opcjonalnie:** `OPENROUTER_MODEL` — nadpisuje domyslny model

---

### Flow aplikacji

```
start
  |
  v
Czy uruchomić monitoring? (t/n)
  |
  t
  |
  v
Loop: co 5 sekund
  ├─ getActiveWindowTitle()      → surowy tytuł (tymczasowy, NIE zapisywany)
  ├─ classifyWindow(title)       → kategoria (przez AI lub fallback słownikowy)
  └─ stats[kategoria] += 5s

  Co 6 pomiarów (= 30s):
  ├─ wyswietl: [Progress] X pomiarow | Y min | Dominuje: kategoria
  └─ Czy zakonczyc i wyswietlic statystyki? (t/n)
         |
         t
         |
         v
  displayStats()   → tabela kategorii z procentami i paskami
  saveStats()      → logs/session-YYYY-MM-DDTHH-MM-SS.json
         |
         v
  Co dalej? (m = nowy monitoring | z = zakonczenie)
```

---

### Struktura plikow

```
js-ai-monitoring-browser-localai/
├── .env                   # OPENROUTER_API_KEY (istnieje)
├── .gitignore             # node_modules/, logs/, dist/ (istnieje)
├── Agents.md              # ten plik — ustalenia projektowe
├── package.json
├── tsconfig.json
└── src/
    └── index.ts           # cala logika w jednym pliku (~200 linii)
```

---

### Kluczowe decyzje implementacyjne

1. **Jeden plik** (`src/index.ts`) — prostota edukacyjna, bez overengineeringu
2. **Batch-based loop** — 6 pomiarow → pauza → pytanie; prostsze niz concurrent readline + loop
3. **Fallback bez AI** — classifyByKeyword() działa gdy brak klucza/połączenia
4. **Temp PS1 script** — zapisywany raz na starcie do `os.tmpdir()`, unika escaping hell
5. **BATCH_SIZE = 6** — 30s dla demo; w komentarzu: "produkcja → 12 (1 minuta)"
6. **Brak dotenv package** — czytamy .env recznie (redukcja zaleznosci)
7. **Zero external deps w runtime** — tylko `openai` package

---

### Uwagi edukacyjne do omowienia

- **Dlaczego nie Ollama?** — OpenRouter jest latwiejs zy w setupie dla demo. Ollama byłaby
  lepszym wyborem produkcyjnym (dane nie opuszczaja komputera).
- **Dlaczego nie screenshot?** — Screenshoty to inwigilacja (Amazon: kara 32M EUR).
  Tytuł okna to minimalny zbior danych zgodny z RODO.
- **Agregat vs surowe dane** — pokazac roznice: `Gmail — negocjacje — 23 min` vs `komunikacja — 23 min`
- **RODO** — pracodawca moze monitorowac kategorie, ale NIE treść.
