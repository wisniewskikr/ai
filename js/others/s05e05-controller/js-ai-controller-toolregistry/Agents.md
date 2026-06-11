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

---

## Dwufazowy routing (zaimplementowany)

### Problem

Przy duzej liczbie narzedzi model dostaje za dużo kontekstu — myli narzedzia, koszt rośnie.

### Rozwiązanie: router przed agentem

```
Pytanie użytkownika
        |
        v
Faza 1 — Router: pytanie + lista tagów → model zwraca pasujące tagi (JSON)
        |
        v
Rejestr filtrowany — model główny dostaje tylko narzedzia z pasującymi tagami
        |
        v
Faza 2 — Agent: pętla tool use z okrojonym zestawem narzedzi
```

### Pliki

| Plik | Rola |
|------|------|
| `src/prompts/router.md` | System prompt routera — instrukcja zwrotu JSON z tagami |
| `src/services/registry.ts` | `getAllTags()` — unikalne tagi z rejestru; `filterByTags()` — filtruje narzedzia |
| `src/services/agent.ts` | `routeTags()` — wywołuje router; `runAgent()` — integruje obie fazy |

### Przykład

Pytanie: `"jaka pogoda w Krakowie?"`

```
Router → ["weather", "local"]
filterByTags(["weather", "local"]) → [check_weather]
Agent dostaje 1 narzedzie zamiast 4
```

### Fallback

Jezeli router zwróci nieparserowalny JSON lub pusty wynik — agent dostaje pełny rejestr.
Logowane jako `[WARN] Router returned unparseable response — falling back to all tools`.

---

## Analiza projektu — co zmienić, czego brakuje

### Co jest dobrze

| Element | Dlaczego działa |
|---------|----------------|
| Osobne foldery `services/`, `prompts/`, `utils/` | Każdy wie gdzie szukać |
| `agent.md` jako edytowalny plik | Zmieniasz zachowanie AI bez dotykania kodu |
| `config.json` na ustawienia, `.env` na sekrety | Sekrety nie wyciekają do repozytorium |

---

### Co zmienić

**1. Schemat narzędzi jest za luźny**

To co masz:
```typescript
inputSchema: { city: "string" }
```

To co wymaga Anthropic API:
```typescript
input_schema: {
  type: "object",
  properties: { city: { type: "string", description: "Nazwa miasta" } },
  required: ["city"]
}
```

Bez tego API zwróci błąd walidacji.

**2. Narzędzie `calculate` — nie używaj `eval()`**

`eval("2 + 2")` to jak wpuszczenie obcego do domu i danie mu kluczy do wszystkich pokoi.
Zamiast tego: biblioteka `mathjs` lub `expr-eval` — oblicza wyrażenia bez ryzyka.

**3. Rejestr bez typów TypeScript**

Teraz to zwykła tablica — TypeScript nie pilnuje struktury. Dodaj interfejs:

```typescript
interface RegistryEntry {
  name: string;
  cost: "none" | "low" | "medium" | "high";
  limitPerDay: number | null;
  tags: string[];
  fallback?: string;
  definition: Tool; // typ z Anthropic SDK
}
```

---

### Czego brakuje — krytyczne

**1. Multi-turn loop — największy brak**

Diagram przepływu w dokumencie jest niepełny. Anthropic tool use działa tak:

```
Krok 1: Wyślij pytanie + narzędzia → model odpowiada: stop_reason: "tool_use"
Krok 2: Wykonaj narzędzie → dostań wynik
Krok 3: Wyślij wynik z powrotem jako "tool_result"
Krok 4: Model generuje TERAZ finalną odpowiedź tekstową
Krok 5: Pokaż odpowiedź użytkownikowi
```

Bez kroku 3 i 4 aplikacja nigdy nie pokaże odpowiedzi — model zwróci `tool_use` i na tym koniec.

> Analogia: kelner bierze zamówienie, idzie do kuchni, ale nigdy nie wraca z jedzeniem.

**2. Licznik `limitPerDay` resetuje się po restarcie**

`limitPerDay: 100` w config.json nie wystarczy — to tylko definicja limitu, nie jego śledzenie.
Każdy restart aplikacji zeruje licznik. Potrzebny plik `logs/usage.json`:

```json
{
  "2026-06-11": {
    "translate_text": 23,
    "summarize": 7
  }
}
```

**3. Brak obsługi `stop_reason`**

Model może odpowiedzieć na trzy sposoby — każdy wymaga innej reakcji:

| `stop_reason` | Co zrobić |
|---------------|-----------|
| `"tool_use"` | Wywołaj narzędzie, wyślij wynik, kontynuuj pętlę |
| `"end_turn"` | Pokaż odpowiedź użytkownikowi |
| `"max_tokens"` | Pokaż błąd — odpowiedź ucięta |

**4. `tags` i `fallback` — wymienione, ale nie zaimplementowane**

Tabela w dokumencie je wymienia, ale schemat TypeScript ich nie zawiera.
Albo są w projekcie, albo nie — nie mogą wisieć tylko w dokumentacji.

---

### Czego brakuje — jakość

| Brak | Skutek |
|------|--------|
| `AbortController` dla timeoutu | `requestTimeoutMs` w config.json nic nie robi |
| Walidacja `config.json` (np. Zod) | Błędna konfiguracja = cicha awaria |
| `tsconfig.json` z `strict: true` | Błędy typowania widać w runtime zamiast przy kompilacji |
| Obsługa pustego inputu w CLI | Użytkownik wciska Enter — nic się nie dzieje |

---

### Kolejność implementacji

Buduj w tej kolejności — każdy krok zależy od poprzedniego:

| Krok | Co budujesz | Dlaczego najpierw |
|------|-------------|-------------------|
| 1 | `src/types.ts` — interfejsy | Wszystko inne korzysta z typów |
| 2 | `registry.ts` — statyczna lista | Bez logiki, tylko dane |
| 3 | `agent.ts` — pętla tool use | Najtrudniejsze, rdzeń aplikacji |
| 4 | Narzędzia (weather, translate, calculate, summarize) | Mają gotowy kontrakt z typów |
| 5 | Logger + usage tracking z persystencją | Potrzebuje gotowych narzędzi |
| 6 | `index.ts` — CLI menu | Ostatnie — tylko warstwa widoku |

> Największe ryzyko to krok 3. Jeśli pętla agenta jest zła, nic nie działa — niezależnie od reszty.
