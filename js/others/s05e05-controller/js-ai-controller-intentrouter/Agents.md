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
  6. [Custom]      Type your own question
  0. Exit
```

- Opcje 1-5: pytania z gory zdefiniowane, pokazuja kazdy typ routingu
- Opcja 6: uzytkownik wpisuje wlasne pytanie — LLM klasyfikuje i kieruje
- Opcja 0: wyjscie

---

## Przeplyw dla opcji 6 (custom)

```
1. Uzytkownik wpisuje pytanie
2. LLM (OpenRouter) klasyfikuje: similarity | relation | global
3. CLI pokazuje: "Detected intent: [TYP]"
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
