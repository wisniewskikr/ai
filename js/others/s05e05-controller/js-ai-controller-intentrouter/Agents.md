# Intent Router — propozycja projektu demo

## Czym jest Intent Router?

Wyobraź sobie bibliotekę z trzema działami: **encyklopedią**, **drzewem genealogicznym** i **streszczeniem całej wiedzy**.
Bibliotekarz (agent) słyszy pytanie i decyduje, do którego działu Cię skierować.
To właśnie robi Intent Router.

---

## Trzy typy pytań

| Typ | Pytanie przykładowe | Gdzie szukamy |
|-----|---------------------|---------------|
| **Podobienstwo** | "Kto jest podobny do Anny?" | Vector Search (szukamy podobnych wektorow) |
| **Relacja** | "Kto raportuje do Jana?" | Graf (chodzimy po polaczeniach) |
| **Globalne** | "Jak wyglada struktura calej firmy?" | GraphRAG (czytamy streszczenie) |

---

## Architektura — jak to dziala?

```
Pytanie uzytkownika
        |
        v
  [Intent Router]  <-- OpenRouter LLM klasyfikuje typ pytania
        |
   -----+------+----------+
   |           |          |
   v           v          v
Vector       Graf      GraphRAG
Search      (relacje)  (globalne)
(podobne)              streszczenie
   |           |          |
   +-----+-----+----------+
         |
         v
    Odpowiedz CLI
```

---

## Stack techniczny

| Warstwa | Technologia | Uwaga |
|---------|-------------|-------|
| Jezyk | TypeScript (Node.js) | |
| LLM / routing | OpenRouter API | klasyfikacja intencji |
| Vector Search | symulowany in-memory | tablica obiektow + cosine similarity |
| Graf | symulowany in-memory | adjacency list (`Map`) |
| GraphRAG | symulowany in-memory | gotowe streszczenie jako string |
| CLI | `readline` (wbudowany) | bez zewnetrznych zaleznosci |

> Demo = prawdziwy routing przez LLM, symulowane bazy danych.
> Celem jest pokazanie mechanizmu, nie infrastruktury.

---

## Dane testowe (in-memory)

Prosta "firma" z pracownikami:

```
Anna (CEO)
├── Jan (CTO)
│   ├── Piotr (Dev)
│   └── Maria (Dev)
└── Ewa (CFO)
    └── Tomasz (Accountant)
```

Kazdy pracownik ma opis tekstowy (do vector search) i polaczenia w grafie (do relacji).

---

## CLI — opcje menu

```
=== Intent Router Demo ===

Select an option:
  1. [Similarity]  Who is most similar to Anna?
  2. [Similarity]  Find someone with leadership skills
  3. [Relation]    Who reports to Jan?
  4. [Relation]    What is the path between Piotr and Ewa?
  5. [Global]      Describe the overall company structure
  6. [Global]      What are the main departments and their responsibilities?
  7. [Custom]      Type your own question
  0. Exit
```

- Opcje 1-6: pytania z gory zdefiniowane, pokazuja kazdy typ routingu
- Opcja 7: uzytkownik wpisuje wlasne pytanie — LLM klasyfikuje i kieruje
- Opcja 0: wyjscie

Dla opcji 1-6 znamy z gory oczekiwany typ intencji — dlatego CLI pokazuje weryfikacje:

```
> You selected: "Who reports to Jan?"
> Expected intent:  relation
> Detected intent:  relation
> Verdict:          CORRECT
>
> Result (graph engine): Jan -> Piotr, Jan -> Maria
```

Jesli LLM sie pomyli:

```
> You selected: "Describe the overall company structure"
> Expected intent:  global
> Detected intent:  similarity    <-- pomylka modelu
> Verdict:          WRONG (expected: global)
>
> Result (similarity engine): Anna - CEO, leadership score: 0.91 ...
```

Dzieki temu uzytkownik widzi na zywo, jak dobrze (lub zle) LLM klasyfikuje intencje.

---

## Przeplyw dla opcji 7 (custom)

```
1. Uzytkownik wpisuje pytanie
2. LLM (OpenRouter) klasyfikuje: similarity | relation | global
3. CLI pokazuje: "Detected intent: [TYP]"  (brak weryfikacji — brak oczekiwanego typu)
4. Wywolanie odpowiedniej funkcji (vector / graph / summary)
5. Wyswietlenie wyniku z etykieta zrodla
```

---

## Struktura plikow

```
src/
  index.ts          # CLI, petla menu
  router.ts         # klasyfikacja intencji przez OpenRouter
  engines/
    vector.ts       # symulowany vector search
    graph.ts        # symulowany graf relacji
    graphrag.ts     # symulowane streszczenie globalne
  data/
    employees.ts    # dane testowe
```

---

## Co pokazuje ten projekt?

| Koncept | Jak jest zilustrowany |
|---------|----------------------|
| Routing Intelligence | LLM decyduje o sciezce, nie if-else |
| Weryfikacja klasyfikacji | dla opcji 1-6: Expected vs Detected + CORRECT/WRONG |
| Trzy typy wyszukiwania | kazdy engine odpowiada inaczej na to samo pytanie |
| Tool Registry (uproszczony) | kazdy engine ma nazwe, opis i funkcje `query()` |
| CLI jako interfejs | prosty, bez frameworkow frontendowych |

---

## Zaleznosci

```json
{
  "dependencies": {
    "openai": "^4.x"
  }
}
```

> Biblioteka `openai` obsługuje OpenRouter przez zmiane `baseURL`.
> Zero innych zaleznosci produkcyjnych.
