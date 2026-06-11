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
| AI / LLM | OpenRouter API (np. `google/gemini-flash-1.5`) |
| CLI | `readline` (wbudowany w Node.js) |
| Brak zewnetrznych frameworków | — proste i przejrzyste |

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
  "model": "google/gemini-flash-1.5",
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

## Uruchomienie

```bash
npm install
cp .env.example .env   # wpisz klucz OpenRouter
npm run dev
```

---

## Rozszerzenia (opcjonalnie, po zrozumieniu podstaw)

- Dodac pole `limit` do rejestru i przerwac wywołanie gdy limit przekroczony
- Dodac log wywołan narzedzi do pliku (pamiec epizodyczna)
- Podmienic mock pogody na prawdziwe API (np. Open-Meteo — bezpłatne)
