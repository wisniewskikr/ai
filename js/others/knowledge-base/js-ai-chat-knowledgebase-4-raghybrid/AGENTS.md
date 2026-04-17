# AGENTS.md — Upgrade z Projektu #2 do Projektu #4 (RAG Hybrydowy)

## Cel

Przekształcić obecną implementację RAG z in-memory vector store (Vectra) na architekturę **hybrydową**,
która łączy wyszukiwanie wektorowe (ChromaDB) z wyszukiwaniem pełnotekstowym (MiniSearch).

Aktualny projekt (#2) używa tylko wyszukiwania semantycznego (Vectra). Docelowy projekt #4 dodaje równoległe wyszukiwanie pełnotekstowe (MiniSearch), łączy wyniki z obu źródeł i dostarcza bogatszy kontekst do LLM.

---

## Stan obecny — Projekt #2

### Architektura
- Wyszukiwanie: **tylko wektorowe** (Vectra in-memory)
- Chunking: `@langchain/textsplitters` (RecursiveCharacterTextSplitter)
- Embeddingi: OpenRouter API (`config.embeddingModel`)
- Chat: OpenRouter API (`config.model`)
- Storage: tymczasowy katalog na dysku (`os.tmpdir()`)

### Pliki źródłowe
```
src/
  index.ts        — punkt wejścia, wywołuje runChat()
  config.ts       — ładuje config.json + OPENROUTER_API_KEY z .env
  api.ts          — sendMessage() do OpenRouter /chat/completions
  embeddings.ts   — embedText() i embedBatch() przez OpenRouter /embeddings
  chunker.ts      — splitIntoChunks() za pomocą LangChain RecursiveCharacterTextSplitter
  vectorStore.ts  — buildIndex() i searchIndex() za pomocą Vectra LocalIndex
  chat.ts         — główna pętla REPL, orkiestruje RAG pipeline
  logger.ts       — logowanie do pliku logs/YYYY-MM-DD.log
```

### Zależności (package.json)
```json
"dependencies": {
  "@langchain/textsplitters": "^1.0.1",
  "dotenv": "^16.4.5",
  "vectra": "^0.14.0"
}
```

### Przepływ danych (obecny)
```
Tekst → chunking → embeddingi → Vectra (in-memory)
Pytanie → embedding → Vectra search (top-K) → kontekst → LLM → odpowiedź
```

---

## Stan docelowy — Projekt #4

### Architektura
- Wyszukiwanie: **hybrydowe** = wektorowe (ChromaDB) + pełnotekstowe (MiniSearch)
- Wyniki z obu źródeł są łączone i deduplikowane przed wysłaniem do LLM

### Przepływ danych (docelowy)
```
Tekst → chunking → embeddingi → ChromaDB + MiniSearch (równoległa indeksacja)

Pytanie
   ↓
   ├── ChromaDB vector search (top-K semantyczne)
   └── MiniSearch full-text search (top-K słowne)
        ↓
   Połączone wyniki (merge + deduplikacja)
        ↓
   Kontekst → LLM → odpowiedź
```

---

## Krok 1 — Aktualizacja zależności

```bash
npm uninstall vectra
npm install chromadb minisearch
```

**Wyjaśnienie:**
- `vectra` — usunąć, zastąpione przez ChromaDB
- `chromadb` — klient TypeScript dla ChromaDB (wyszukiwanie wektorowe)
- `minisearch` — in-memory full-text search, pure JS, zero konfiguracji serwera

`@langchain/textsplitters` i `dotenv` pozostają bez zmian.

Zaktualizowany `package.json`:
```json
"dependencies": {
  "@langchain/textsplitters": "^1.0.1",
  "chromadb": "^1.9.2",
  "dotenv": "^16.4.5",
  "minisearch": "^7.1.0"
}
```

---

## Krok 2 — Modyfikacja `src/vectorStore.ts` — Vectra → ChromaDB

Przepisać cały plik. Usunąć `vectra`, zastąpić `chromadb`.

**Interfejs publiczny (zachować te same sygnatury funkcji):**
```typescript
export async function buildIndex(chunks: string[], embeddings: number[][], config: Config): Promise<Collection>
export async function searchIndex(collection: Collection, queryEmbedding: number[], topK: number): Promise<string[]>
```

**Kluczowe szczegóły ChromaDB API:**
```typescript
import { ChromaClient } from 'chromadb';

// Klient ephemeral (in-memory, bez serwera) — preferowane podejście
const client = new ChromaClient({ path: 'http://localhost:8000' });
// Uwaga: sprawdź aktualną dokumentację chromadb npm — może istnieć EphemeralClient lub tryb in-memory

// Tworzenie kolekcji z unikalną nazwą
const collection = await client.createCollection({
  name: `rag-${Date.now()}`,
  embeddingFunction: undefined,  // embeddingi dostarczamy sami
});

// Dodawanie dokumentów
await collection.add({
  ids: chunks.map((_, i) => `chunk-${i}`),
  embeddings: embeddings,
  documents: chunks,
});

// Wyszukiwanie
const results = await collection.query({
  queryEmbeddings: [queryEmbedding],
  nResults: topK,
});
// Wyniki: results.documents[0] — tablica stringów (dokumentów)
```

> **Uwaga dotycząca ChromaDB in-memory:**
> Wersja `chromadb` npm 1.x wymaga działającego serwera HTTP. Sprawdź czy dostępny jest `EphemeralClient`
> (tryb bez serwera). Jeśli nie — uruchom serwer przez Docker:
> ```bash
> docker run -p 8000:8000 chromadb/chroma
> ```

---

## Krok 3 — Nowy plik `src/fullTextSearch.ts`

Stworzyć nowy moduł odpowiedzialny za full-text search z MiniSearch.

```typescript
import MiniSearch from 'minisearch';

export function buildFullTextIndex(chunks: string[]): MiniSearch {
  const index = new MiniSearch({ fields: ['text'], storeFields: ['text'] });
  const docs = chunks.map((text, id) => ({ id, text }));
  index.addAll(docs);
  return index;
}

export function searchFullText(index: MiniSearch, query: string, topK: number): string[] {
  const results = index.search(query, { limit: topK });
  return results.map(r => r.text as string);
}
```

**Kluczowe szczegóły MiniSearch:**
- Import: `import MiniSearch from 'minisearch'` (lub `import { MiniSearch } from 'minisearch'` — sprawdź wersję)
- Dokumenty muszą mieć pole `id` + co najmniej jedno pole tekstowe
- `fields` — pola do indeksowania
- `storeFields` — pola do zwracania w wynikach
- Działa w pełni in-memory, zero konfiguracji serwera

---

## Krok 4 — Modyfikacja `src/chat.ts` — hybrydowe wyszukiwanie

### Zmiany w imporcie
Dodać import `buildFullTextIndex`, `searchFullText` z `./fullTextSearch`.
Usunąć import `LocalIndex` z `vectra`.
Zaktualizować typ `index` z `LocalIndex` na `Collection` (z `chromadb`).

### Faza inicjalizacji — dodać budowanie indeksu full-text

Po zbudowaniu indeksu wektorowego dodać:
```typescript
console.log('Building full-text index...');
const fullTextIndex = buildFullTextIndex(chunks);
console.log('Full-text index ready.\n');
```

### Faza odpowiedzi — hybrydowe wyszukiwanie

Zastąpić obecne:
```typescript
const relevantChunks = await searchIndex(index, queryEmbedding, config.topK);
```

Nowym kodem:
```typescript
const [vectorChunks, textChunks] = await Promise.all([
  searchIndex(collection, queryEmbedding, config.topK),
  Promise.resolve(searchFullText(fullTextIndex, trimmed, config.topK)),
]);

// Deduplikacja — zachowaj kolejność, usuń duplikaty
const seen = new Set<string>();
const combined: string[] = [];
for (const chunk of [...vectorChunks, ...textChunks]) {
  if (!seen.has(chunk)) {
    seen.add(chunk);
    combined.push(chunk);
  }
}
const relevantChunks = combined.slice(0, config.topK);

log('INFO', `Retrieved ${vectorChunks.length} vector + ${textChunks.length} text chunks (${relevantChunks.length} after dedup)`);
```

---

## Krok 5 — Opcjonalnie: rozszerzenie `src/config.ts`

Można dodać do interfejsu `Config`:
```typescript
chromaUrl?: string;   // domyślnie 'http://localhost:8000'
```

Oraz uzupełnić `config.json` o to pole.

---

## Pliki do zmiany — podsumowanie

| Plik | Akcja | Co zmienić |
|---|---|---|
| `package.json` | Modyfikacja | Usunąć `vectra`, dodać `chromadb` + `minisearch` |
| `src/vectorStore.ts` | Przepisać | Vectra LocalIndex → ChromaDB Collection |
| `src/fullTextSearch.ts` | Stworzyć nowy | MiniSearch index + search |
| `src/chat.ts` | Modyfikacja | Dodać full-text index, hybrydowe wyszukiwanie |
| `src/config.ts` | Opcjonalnie | Dodać `chromaUrl?: string` do interfejsu Config |

## Pliki bez zmian

- `src/index.ts`
- `src/api.ts`
- `src/embeddings.ts`
- `src/chunker.ts`
- `src/logger.ts`

---

## Kluczowa różnica Projekt #2 vs Projekt #4

| | Projekt #2 (RAG wektorowy) | Projekt #4 (RAG hybrydowy) |
|---|---|---|
| Vector search | Vectra (in-memory) | ChromaDB |
| Full-text search | brak | MiniSearch |
| Wyniki | tylko semantyczne | semantyczne + słowne |
| Trafność słów kluczowych | słaba | dobra |
| Trafność znaczenia | dobra | dobra |
| Złożoność | prosta | umiarkowana |

---

## Weryfikacja po implementacji

1. Uruchomić `npm run dev`
2. Sprawdzić czy oba indeksy budują się (logi w konsoli)
3. Zadać pytanie z dokładnym fragmentem tekstu z bazy → MiniSearch powinno znaleźć
4. Zadać pytanie semantyczne (inne słowa, to samo znaczenie) → ChromaDB powinno znaleźć
5. Sprawdzić że deduplikacja działa (ten sam chunk nie pojawia się dwa razy w kontekście)
