# AGENTS.md — Upgrade z Projektu #2 do Projektu #4 (RAG Hybrydowy)

## Cel

Przekształcić obecną implementację RAG z in-memory vector store (Vectra) na architekturę **hybrydową**,
która łączy wyszukiwanie wektorowe z wyszukiwaniem pełnotekstowym w jednej bibliotece — **Orama**.

Aktualny projekt (#2) używa tylko wyszukiwania semantycznego (Vectra). Docelowy projekt #4 dodaje
hybrydowe wyszukiwanie (wektorowe + pełnotekstowe) przez bibliotekę `@orama/orama`, która obsługuje
oba tryby natywnie bez żadnego serwera HTTP ani Dockera.

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
- Wyszukiwanie: **hybrydowe** = wektorowe + pełnotekstowe w jednej bibliotece (**Orama**)
- Orama obsługuje oba tryby natywnie — brak ręcznego merge/dedup w kodzie aplikacji
- Zero serwera, zero Dockera — wszystko in-process w `node_modules`

### Dlaczego Orama zamiast ChromaDB + MiniSearch
| | ChromaDB + MiniSearch | Orama |
|---|---|---|
| Liczba bibliotek | 2 | 1 |
| Wymaga serwera HTTP | tak (ChromaDB) | nie |
| Wymaga Dockera | tak | nie |
| Hybrid search | ręczna implementacja | natywna, wbudowana |
| Kod orkiestracji | merge + dedup w chat.ts | brak — jedna funkcja |

### Przepływ danych (docelowy)
```
Tekst → chunking → embeddingi → Orama (in-process)

Pytanie
   ↓
   Orama hybrid search (wektorowe + pełnotekstowe jednocześnie)
        ↓
   Kontekst → LLM → odpowiedź
```

---

## Krok 1 — Aktualizacja zależności

```bash
npm uninstall vectra chromadb minisearch
npm install @orama/orama
```

**Wyjaśnienie:**
- `vectra`, `chromadb`, `minisearch` — usunąć
- `@orama/orama` — in-process hybrid search (wektorowe + pełnotekstowe), pure JS, zero konfiguracji serwera

`@langchain/textsplitters` i `dotenv` pozostają bez zmian.

Zaktualizowany `package.json`:
```json
"dependencies": {
  "@langchain/textsplitters": "^1.0.1",
  "@orama/orama": "^2.0.0",
  "dotenv": "^16.4.5"
}
```

---

## Krok 2 — Modyfikacja `src/config.ts`

Dodać `embeddingDimension` do interfejsu `Config` — Orama musi znać wymiarowość wektora przy tworzeniu schematu:

```typescript
export interface Config {
  // ...istniejące pola...
  embeddingDimension: number;  // np. 1536 dla text-embedding-ada-002
}
```

Oraz w `config.json`:
```json
"embeddingDimension": 1536
```

Wartość musi odpowiadać modelowi embeddings (`config.embeddingModel`).

---

## Krok 3 — Modyfikacja `src/vectorStore.ts` — Vectra/ChromaDB → Orama

Przepisać cały plik. Orama zastępuje zarówno Vectra, jak i MiniSearch.

**Interfejs publiczny:**
```typescript
export async function buildIndex(chunks: string[], embeddings: number[][], config: Config): Promise<OramaDB>
export async function searchIndex(db: OramaDB, queryEmbedding: number[], query: string, topK: number): Promise<string[]>
```

> Uwaga: `searchIndex` teraz przyjmuje dodatkowy parametr `query: string` (tekst pytania) potrzebny do trybu hybrydowego.

**Kluczowe szczegóły Orama API:**
```typescript
import { create, insertMultiple, search, Orama } from '@orama/orama';

type OramaDB = Orama<any>;

// Tworzenie bazy — schema musi zawierać wymiar wektora
const db = await create({
  schema: {
    id: 'string',
    text: 'string',
    embedding: `vector[${config.embeddingDimension}]`,
  } as any,
});

// Wstawianie dokumentów
await insertMultiple(db, chunks.map((text, i) => ({ id: `chunk-${i}`, text, embedding: embeddings[i] })));

// Hybrid search — wektorowe + pełnotekstowe jednocześnie
const results = await search(db, {
  mode: 'hybrid',
  term: query,
  vector: { value: queryEmbedding, property: 'embedding' },
  limit: topK,
} as any);

// Wyniki: results.hits[i].document.text
```

---

## Krok 4 — Usunięcie `src/fullTextSearch.ts`

Plik nie jest już potrzebny — Orama obsługuje full-text search natywnie.
Usunąć plik lub pozostawić z komentarzem.

---

## Krok 5 — Modyfikacja `src/chat.ts`

### Zmiany w imporcie
- Usunąć: `import { Collection } from 'chromadb'`
- Usunąć: `import { buildFullTextIndex, searchFullText } from './fullTextSearch'`
- `buildIndex` i `searchIndex` importowane z `./vectorStore` — bez zmian

### Faza inicjalizacji — uproszczenie
Zastąpić dwa osobne bloki (vector index + full-text index):
```typescript
console.log('Building hybrid index...');
const db = await buildIndex(chunks, embeddings, config);
console.log('Hybrid index ready.\n');
```

### Faza odpowiedzi — uproszczenie
Zastąpić cały blok `Promise.all` + merge + dedup:
```typescript
const relevantChunks = await searchIndex(db, queryEmbedding, trimmed, config.topK);
log('INFO', `Retrieved ${relevantChunks.length} chunks (hybrid search)`);
```

---

## Pliki do zmiany — podsumowanie

| Plik | Akcja | Co zmienić |
|---|---|---|
| `package.json` | Modyfikacja | Usunąć `vectra`/`chromadb`/`minisearch`, dodać `@orama/orama` |
| `src/config.ts` | Modyfikacja | Dodać `embeddingDimension: number` |
| `src/vectorStore.ts` | Przepisać | Orama hybrid store |
| `src/fullTextSearch.ts` | Usunąć / zostawić pusty | Nie jest już potrzebny |
| `src/chat.ts` | Uprościć | Usunąć ręczny merge/dedup, jedno wywołanie searchIndex |

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
| Vector search | Vectra (in-memory) | Orama (in-process) |
| Full-text search | brak | Orama (natywny) |
| Serwer/Docker | nie | nie |
| Wyniki | tylko semantyczne | semantyczne + słowne |
| Trafność słów kluczowych | słaba | dobra |
| Trafność znaczenia | dobra | dobra |
| Złożoność kodu | prosta | prosta (Orama ukrywa złożoność) |

---

## Weryfikacja po implementacji

1. Uruchomić `npm run dev`
2. Sprawdzić czy indeks buduje się (log: "Hybrid index ready.")
3. Zadać pytanie z dokładnym fragmentem tekstu z bazy → full-text search powinno znaleźć
4. Zadać pytanie semantyczne (inne słowa, to samo znaczenie) → vector search powinno znaleźć
5. Sprawdzić logi: `Retrieved N chunks (hybrid search)`
