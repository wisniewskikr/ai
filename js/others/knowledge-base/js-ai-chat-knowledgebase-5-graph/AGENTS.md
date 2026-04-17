# AGENTS.md — Migracja z Projektu 1 do Projektu 5 (Knowledge Graph)

## Stan obecny — Projekt 1 (Pełny kontekst)

Projekt ładuje całą bazę wiedzy (`data/data.txt`) jako plain text do system promptu. Brak struktury, brak relacji między pojęciami.

**Kluczowe pliki:**
- `src/chat.ts` — `loadKnowledgeBase()` czyta plik i wrzuca cały tekst do `history[0].content` (system prompt)
- `src/config.ts` — `Config.knowledgeBasePath` wskazuje na `data/data.txt`
- `data/data.txt` — płaski tekst z faktami o użytkowniku (Joe Doe)

**Ograniczenia Projektu 1:**
- Cała baza idzie do kontekstu przy każdym zapytaniu (nieefektywne dla dużych baz)
- Brak możliwości odpowiadania na pytania wymagające relacji między pojęciami
- Skalowanie zerowe — przy dużej bazie przekroczymy limit kontekstu

---

## Cel — Projekt 5 (Knowledge Graph)

**Architektura:** Grafowa
**Narzędzia:** JSON (plik z węzłami i krawędziami) + ręczny traversal w TypeScript
**Cel edukacyjny:** Zrozumienie relacji między pojęciami, graph traversal, kontekst budowany dynamicznie

### Jak działa Knowledge Graph

```
[węzeł: "Joe Doe"] --pracuje_w--> [węzeł: "tech company Austin"]
[węzeł: "Joe Doe"] --ma_żonę--> [węzeł: "Clara"]
[węzeł: "Clara"] --ma_dzieci--> [węzeł: "Lily"] i [węzeł: "Max"]
[węzeł: "Joe Doe"] --ma_psa--> [węzeł: "Biscuit"]
[węzeł: "Biscuit"] --jest_rasą--> [węzeł: "golden retriever"]
```

Model AI nie dostaje całej bazy — dostaje tylko **powiązane węzły** znalezione przez traversal grafu.

---

## Struktura danych — JSON Knowledge Graph

### Format pliku `data/knowledge-graph.json`

```json
{
  "nodes": [
    { "id": "joe_doe", "label": "Person", "properties": { "name": "Joe Doe", "role": "software engineer" } },
    { "id": "clara", "label": "Person", "properties": { "name": "Clara" } },
    { "id": "lily", "label": "Person", "properties": { "name": "Lily", "age": 7 } },
    { "id": "max", "label": "Person", "properties": { "name": "Max", "age": 4 } },
    { "id": "biscuit", "label": "Animal", "properties": { "name": "Biscuit", "breed": "golden retriever" } },
    { "id": "austin_company", "label": "Organization", "properties": { "description": "mid-sized tech company", "location": "Austin, Texas" } }
  ],
  "edges": [
    { "from": "joe_doe", "to": "clara", "relation": "married_to" },
    { "from": "joe_doe", "to": "lily", "relation": "parent_of" },
    { "from": "joe_doe", "to": "max", "relation": "parent_of" },
    { "from": "joe_doe", "to": "biscuit", "relation": "owns_pet" },
    { "from": "joe_doe", "to": "austin_company", "relation": "works_at" }
  ]
}
```

---

## Nowe pliki do stworzenia

### 1. `src/graph.ts` — silnik grafu

Odpowiedzialności:
- Załadowanie `data/knowledge-graph.json`
- Typy TypeScript: `Node`, `Edge`, `KnowledgeGraph`
- Funkcja `searchNodes(graph, query: string): Node[]` — znajdź węzły pasujące do zapytania (match po `id`, `label`, wartościach w `properties`)
- Funkcja `getNeighbors(graph, nodeIds: string[], depth: number): Node[]` — BFS/DFS traversal do zadanej głębokości
- Funkcja `buildContext(graph, query: string): string` — główna funkcja: szuka węzłów → pobiera sąsiadów (głębokość 2) → serializuje do czytelnego tekstu dla LLM

**Sygnatura buildContext:**
```typescript
export function buildContext(graph: KnowledgeGraph, query: string): string
// Zwraca sformatowany tekst z węzłami i relacjami pasującymi do zapytania
```

### 2. Zaktualizować `src/chat.ts`

Zmiana: zamiast ładować cały plik jako string, importować `buildContext` z `graph.ts` i wywoływać je przy każdym pytaniu użytkownika.

```typescript
// PRZED (Projekt 1):
const knowledgeBase = loadKnowledgeBase(config.knowledgeBasePath);
// system prompt z całą bazą raz przy starcie

// PO (Projekt 5):
const graph = loadGraph(config.knowledgeBasePath); // załaduj graf raz
// przy każdym pytaniu:
const context = buildContext(graph, trimmed);
// wyślij context + pytanie do modelu (bez stałego system promptu z bazą)
```

**Dwa podejścia do wysyłania kontekstu:**
- **Opcja A (prostsza):** Przebuduj `history[0]` (system prompt) przed każdym zapytaniem — wstaw aktualny kontekst z grafu
- **Opcja B (czystsza):** Dodaj wiadomość `user` z kontekstem bezpośrednio przed właściwym pytaniem i nie trzymaj bazy w system promptu

Zalecana Opcja A — mniej zmian w `chat.ts`.

### 3. Zaktualizować `src/config.ts`

Zmienić `knowledgeBasePath` tak żeby wskazywał na `data/knowledge-graph.json` zamiast `data/data.txt`.

### 4. Zaktualizować `data/`

- Stworzyć `data/knowledge-graph.json` z danymi Joe Doe przekonwertowanymi na węzły i krawędzie
- Zachować `data/data.txt` jako referencję / backup

---

## Algorytm traversal (graph.ts — szczegóły)

### searchNodes — dopasowanie węzłów do zapytania

```
1. Tokenizuj query → słowa kluczowe (lowercase)
2. Dla każdego węzła: sprawdź czy jakiekolwiek słowo kluczowe
   pasuje do: node.id, node.label, lub dowolnej wartości w node.properties
3. Zwróć listę pasujących węzłów
```

### getNeighbors — BFS do głębokości N

```
1. Zainicjalizuj kolejkę z węzłami startowymi, visited = Set(startNodeIds)
2. Dla każdego węzła z kolejki: znajdź wszystkie krawędzie (from lub to = nodeId)
3. Dodaj połączone węzły do kolejki jeśli nie visited
4. Powtarzaj do osiągnięcia depth
5. Zwróć wszystkie odwiedzone węzły
```

### buildContext — serializacja do tekstu

```
Format wyjściowy dla LLM:

Nodes:
- Joe Doe (Person): software engineer, works in Austin Texas
- Clara (Person): wife of Joe Doe

Relations:
- Joe Doe --married_to--> Clara
- Joe Doe --parent_of--> Lily
- Joe Doe --parent_of--> Max
```

---

## Kroki implementacji (kolejność)

1. **Stworzyć `data/knowledge-graph.json`** — skonwertować fakty z `data.txt` na węzły i krawędzie
2. **Stworzyć `src/graph.ts`** — typy + `loadGraph` + `searchNodes` + `getNeighbors` + `buildContext`
3. **Zaktualizować `src/config.ts`** — `knowledgeBasePath` domyślnie na `data/knowledge-graph.json`
4. **Zaktualizować `src/chat.ts`** — zastąpić `loadKnowledgeBase` + statyczny system prompt na dynamiczny `buildContext` przy każdym pytaniu
5. **Zaktualizować `config.json`** — zmienić ścieżkę do pliku danych
6. **Przetestować ręcznie** — zadać pytania wymagające przejścia przez relacje (np. "Jak ma na imię żona Joe?" → traversal: joe_doe → married_to → clara)

---

## Pytania testowe do weryfikacji poprawności

| Pytanie | Oczekiwana trasa traversal |
|---|---|
| "What is Joe's wife's name?" | joe_doe → married_to → clara |
| "How many kids does Joe have?" | joe_doe → parent_of → [lily, max] |
| "What breed is Joe's dog?" | joe_doe → owns_pet → biscuit → breed |
| "Where does Joe work?" | joe_doe → works_at → austin_company |
| "How old is Lily?" | joe_doe → parent_of → lily → age |

---

## Czego NIE zmieniać

- `src/api.ts` — bez zmian (HTTP client do OpenRouter)
- `src/logger.ts` — bez zmian
- `src/index.ts` — bez zmian
- `package.json` — nie trzeba nowych zależności (JSON + ręczny traversal = zero dependencies)
- `.env`, `.env.example` — bez zmian

---

## Diagram architektury Projektu 5

```
Pytanie użytkownika: "What is Joe's dog's breed?"
        ↓
    buildContext(graph, query)
        ↓
    searchNodes → [joe_doe]          ← "Joe" pasuje do node.id
        ↓
    getNeighbors(depth=2)
        ↓
    joe_doe → biscuit → "golden retriever"
        ↓
    Serializacja do tekstu kontekstu
        ↓
    [kontekst z grafu] + pytanie → API (OpenRouter)
        ↓
    "Joe's dog Biscuit is a golden retriever."
```
