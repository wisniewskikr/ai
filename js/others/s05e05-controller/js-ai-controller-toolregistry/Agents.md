# Tool Registry Hello World — Propozycja projektu

## Co to jest?

Wyobrax sobie szufladnik z narzędziami. Kazde narzedzie ma etykietke: co robi, ile kosztuje i kiedy go uzywac.
AI nie zgaduje — zagląda do szufladnika i wybiera właściwe narzedzie.

To właśnie **Tool Registry**.

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
src/
  index.ts          — punkt wejscia, menu CLI
  registry.ts       — definicja Tool Registry (katalog narzedzi)
  agent.ts          — agent: wysyla zapytanie do OpenRouter z tool use
  tools/
    weather.ts      — narzedzie: pogoda dla miasta (mock)
    translator.ts   — narzedzie: tlumaczenie tekstu PL/EN
    calculator.ts   — narzedzie: obliczenia matematyczne
    summarizer.ts   — narzedzie: streszczanie tekstu
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
