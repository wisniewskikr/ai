# Tool Registry Hello World — Propozycja projektu

## Co to jest?

Wyobrax sobie szufladnik z narzędziami. Kazde narzedzie ma etykietke: co robi, ile kosztuje i kiedy go uzywac.
AI nie zgaduje — zagląda do szufladnika i wybiera właściwe narzedzie.

To właśnie **Tool Registry**.

---

## Tool Registry vs zwykły zestaw narzędzi

### Zwykły zestaw narzędzi

Przekazujesz modelowi listę funkcji. Model wybiera które wywołac. To wszystko.

```typescript
// Ty decydujesz co przekazac — zwykle "wszystko"
tools: [weatherTool, translateTool, calculateTool, summarizerTool]
```

Problem: przy 50+ narzędziach model dostaje za dużo kontekstu, myli narzędzia,
a Ty nie masz kontroli nad kosztami ani limitami.

### Tool Registry — co dodaje?

Warstwa posrednia z dodatkowymi metadanymi:

| Pole | Przykład | Po co |
|------|---------|-------|
| `cost` | `"low"` / `"high"` | Nie ładujesz drogich narzedzi bez powodu |
| `limit` | `100/dzien` | Przerywasz zanim przekroczysz limit API |
| `tags` | `["math", "local"]` | Filtrujesz narzedzia wg kontekstu zapytania |
| `fallback` | `calculateTool` | Gdy narzedzie pada — rejestr wie co uzyc zamiast |

Zamiast dawac modelowi wszystko:

```typescript
// Rejestr filtruje — model dostaje tylko co potrzeba
const relevantTools = registry.getToolsFor(userIntent);
```

### Analogia

- **Zwykłe narzedzia** = wysypujesz cały kufer na stół i mówisz "wybierz".
- **Tool Registry** = masz szufladnik z etykietkami — nie otwierasz szuflady z wiertarką gdy wystarczy wkret ręcznie.

> Przy 3–5 narzędziach rejestr to overengineering. Przy 20+ to koniecznosc.

---

## Cel projektu

Pokazac w prostym demo jak działa:

| Koncept | Co pokazuje |
|---------|-------------|
| **Tool Registry** | Katalog narzedzi z opisem, kosztem i limitami |
| **Routing Intelligence** | Agent wybiera narzedzie na podstawie pytania uzytkownika |
| **CLI z menu** | Uzytkownik wybiera opcje z listy lub wpisuje własne pytanie |

---

## Stack

| Element | Technologia |
|---------|-------------|
| Jezyk | TypeScript (Node.js) |
| AI / LLM | OpenRouter API — `anthropic/claude-haiku-4-5` |
| CLI | `readline` (wbudowany w Node.js) |
| Brak zewnetrznych frameworków | — proste i przejrzyste |

---

## Wybór modelu AI

W tym projekcie liczy sie jedna rzecz: **czy model niezawodnie wybiera narzedzie**.
To nie zadanie na rozumowanie — to zadanie na precyzje.

### Porównanie kandydatów

| Model (OpenRouter) | Tool Use | Szybkosc | Koszt (1M tokenów in/out) | Uwagi |
|--------------------|----------|----------|--------------------------|-------|
| `anthropic/claude-haiku-4-5` | Doskonały | Bardzo szybki | $0.80 / $4.00 | Najlepsza precyzja tool use w tej klasie cenowej |
| `google/gemini-2.0-flash-001` | Dobry | Bardzo szybki | $0.10 / $0.40 | Najtanszy, ale slabszy routing przy niejednoznacznych pytaniach |
| `openai/gpt-4o-mini` | Dobry | Szybki | $0.15 / $0.60 | Solidny, ale tool use gorszy niz Haiku |
| `anthropic/claude-sonnet-4-5` | Doskonały | Sredni | $3.00 / $15.00 | Przesadna moc jak na demo z 4 narzędziami |

### Rekomendacja: `anthropic/claude-haiku-4-5`

Dlaczego:

- **Tool use to rdzen tego projektu** — Haiku ma najlepsza precyzje wyboru narzedzi w swojej klasie cenowej
- **Szybki** — odpowiedz w CLI pojawia sie natychmiast
- **Tani** — demo mozna uruchamiac bez liczenia tokenów
- **Dostepny przez OpenRouter** — bez osobnego konta Anthropic

> Analogia: nie bierzesz Ferrari do przejazdu 2 km — ale bierzesz niezawodne auto, nie rower.
> Gemini jest jak rower — działa, ale przy zakrecie (niejednoznaczne pytanie) możesz sie wywrocic.

---

## Struktura aplikacji

```
project/
├── src/
│   ├── prompts/
│   │   └── agent.md          — system prompt dla agenta (edytowalny bez zmiany kodu)
│   ├── services/
│   │   ├── registry.ts       — Tool Registry: katalog narzedzi z metadanymi
│   │   ├── agent.ts          — wysyla zapytanie do OpenRouter z tool use
│   │   ├── weather.ts        — narzedzie: pogoda dla miasta (mock)
│   │   ├── translator.ts     — narzedzie: tlumaczenie tekstu PL/EN
│   │   ├── calculator.ts     — narzedzie: obliczenia matematyczne
│   │   └── summarizer.ts     — narzedzie: streszczanie tekstu
│   ├── utils/
│   │   └── logger.ts         — zapis logów do katalogu logs/
│   └── index.ts              — punkt wejscia, menu CLI
├── logs/                     — logi wywołan narzedzi
├── config.json               — modele, limity, timeouty (bez sekretów)
├── .env                      — OPENROUTER_API_KEY (nie commituj!)
├── .env.example              — szablon zmiennych srodowiskowych
└── Readme.md                 — dokumentacja po angielsku
```

### config.json — co zawiera?

```json
{
  "model": "anthropic/claude-haiku-4-5",
  "maxTokens": 1024,
  "requestTimeoutMs": 10000,
  "tools": {
    "weather": { "cost": "low", "limitPerDay": 100 },
    "translate": { "cost": "low", "limitPerDay": 200 },
    "calculate": { "cost": "none", "limitPerDay": null },
    "summarize": { "cost": "medium", "limitPerDay": 50 }
  }
}
```

### logs/ — format wpisu

```
[2026-06-11 14:23:01] [INFO]  Uzytkownik wybrał opcje: 2 (tlumaczenie)
[2026-06-11 14:23:02] [INFO]  Agent wybrał narzedzie: translate_text
[2026-06-11 14:23:03] [INFO]  Narzedzie wykonane pomyslnie — czas: 1.2s
[2026-06-11 14:23:10] [WARN]  Zbliżasz sie do limitu dziennego: translate_text (180/200)
[2026-06-11 14:23:15] [ERROR] Przekroczono limit: summarize (50/50) — zapytanie odrzucone
```

---

## Menu CLI

Uzytkownik widzi liste opcji:

```
=== Tool Registry Demo ===

Wybierz opcje:
  1. Sprawdz pogode dla miasta
  2. Przetlumacz tekst na angielski
  3. Rozwiaz zadanie matematyczne
  4. Strescij podany tekst
  5. Wpisz własne pytanie
  0. Wyjscie
```

Opcje 1–4 to gotowe scenariusze z wypełnionym wejsciem.
Opcja 5 pozwala uzytkownikowi wpisac dowolne pytanie — agent sam wybiera narzedzie.
Opcja 0 konczy program.

---

## Tool Registry — jak wyglada?

```typescript
const toolRegistry = [
  {
    name: "check_weather",
    description: "Sprawdza pogode dla podanego miasta",
    cost: "low",
    inputSchema: { city: "string" }
  },
  {
    name: "translate_text",
    description: "Tlumaczy tekst z polskiego na angielski lub odwrotnie",
    cost: "low",
    inputSchema: { text: "string", targetLanguage: "string" }
  },
  {
    name: "calculate",
    description: "Oblicza wynik wyraze nia matematycznego",
    cost: "none",
    inputSchema: { expression: "string" }
  },
  {
    name: "summarize",
    description: "Streszcza podany tekst do max 3 zdan",
    cost: "medium",
    inputSchema: { text: "string" }
  }
];
```

---

## Jak działa przepływ?

```
Uzytkownik wpisuje pytanie
        |
        v
Agent wysyla pytanie do OpenRouter
+ lista narzedzi z rejestru (tool use)
        |
        v
LLM wybiera narzedzie i parametry
        |
        v
Aplikacja wykonuje funkcje narzedzia
        |
        v
Wynik wraca do uzytkownika w terminalu
```

---

## Co demonstruje kazda opcja menu?

| Opcja | Narzedzie | Co pokazuje |
|-------|-----------|-------------|
| 1 — Pogoda | `check_weather` | Agent przekazuje miasto do narzedzia |
| 2 — Tlumaczenie | `translate_text` | Agent wykrywa jezyk i kierunek tlumaczenia |
| 3 — Matematyka | `calculate` | Narzedzie bez kosztów AI — logika lokalna |
| 4 — Streszczenie | `summarize` | Agent pracuje z dluzszym tekstem |
| 5 — Własne pytanie | (agent decyduje) | Pełny routing — agent sam wybiera narzedzie |

---

## Kluczowe pojecia z dokumentu Master Controller

| Pojecie | Jak widac w tym projekcie |
|---------|--------------------------|
| **Tool Registry** | `registry.ts` — jeden słownik wszystkich narzedzi |
| **Routing Intelligence** | Agent (LLM) wybiera narzedzie, nie if-else |
| **Graduated Autonomy** | Poziom 2 (Supervised) — uzytkownik inicjuje kazde zapytanie |
| **Brittle Connectors** | Narzedzie `weather` to mock — łatwo podmienic na prawdziwe API |

---

## Readme.md — zawartość

> Plik w jezyku angielskim. Pisany prosto — zrozumiały bez znajomosci kodu.
> Tabele i punkty zamiast blokow tekstu. Analogie tam, gdzie pojecie jest trudne.

---

Planowana zawartosc `Readme.md`:

---

```markdown
# Tool Registry Hello World

Think of a toolbox with labels on every drawer.
The AI doesn't guess — it reads the label and picks the right tool.
That's a Tool Registry.

## What this project shows

| Concept | What you see |
|---------|-------------|
| **Tool Registry** | A catalog of tools with description, cost, and daily limits |
| **Routing Intelligence** | The agent picks the right tool — no if-else chains |
| **CLI menu** | Choose a preset scenario or type your own question |

## Tool Registry vs plain tools

**Plain tools** — you dump everything on the table and say "pick one":
- Works fine for 3–5 tools
- Falls apart at 20+ tools (model gets confused, costs spike)

**Tool Registry** — a labeled toolbox with extra metadata:

| Field | Example | Why |
|-------|---------|-----|
| `cost` | `"low"` / `"high"` | Skip expensive tools when not needed |
| `limit` | `100/day` | Stop before hitting API limits |
| `tags` | `["math", "local"]` | Filter tools by request context |
| `fallback` | `calculateTool` | Know what to use when a tool fails |

> Rule of thumb: plain tools for demos, registry for production.

## Requirements

- Node.js 20+
- OpenRouter API key — get one at openrouter.ai

## Installation

```bash
npm install
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

## Run

```bash
npm run dev
```

## Menu

```
=== Tool Registry Demo ===

Pick an option:
  1. Check weather for a city
  2. Translate text to English
  3. Solve a math problem
  4. Summarize a text
  5. Type your own question
  0. Exit
```

Options 1–4 are preset scenarios.
Option 5 lets the agent choose the tool on its own.

## File structure

```
src/
  prompts/      — agent system prompt (edit without touching code)
  services/     — tools + registry + agent logic
  utils/        — logger
  index.ts      — CLI entry point
config.json     — model name, limits, timeouts
logs/           — tool call logs
```
```

---

---

## Rozszerzenia (opcjonalnie, po zrozumieniu podstaw)

- Dodac pole `limit` do rejestru i przerwac wywołanie gdy limit przekroczony
- Dodac log wywołan narzedzi do pliku (pamiec epizodyczna)
- Podmienic mock pogody na prawdziwe API (np. Open-Meteo — bezpłatne)
