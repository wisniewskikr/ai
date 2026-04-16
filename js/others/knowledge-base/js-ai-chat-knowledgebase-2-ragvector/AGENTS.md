# AGENTS.md — Transformacja projektu do architektury RAG z in-memory vector store

## Cel

Przekształć aktualny projekt z architektury **pełnego kontekstu** na architekturę **RAG z wektorową bazą danych in-memory**.

Aktualny projekt (projekt #1) ładuje całą bazę wiedzy jako system prompt. Docelowy projekt #2 dzieli bazę wiedzy na fragmenty (chunking), zamienia je na embeddingi, przechowuje w Vectra (in-memory vector store) i przy każdym pytaniu wyszukuje semantycznie trafne fragmenty.

---

## Stan aktualny

- `src/chat.ts` — funkcja `loadKnowledgeBase()` wczytuje cały plik i wstawia go do system message
- Baza wiedzy trafia w całości do okna kontekstu przy każdej rozmowie
- Brak jakiegokolwiek mechanizmu wyszukiwania — model widzi wszystko naraz
- Zależności: tylko `dotenv`

---

## Stan docelowy

```
Plik bazy wiedzy
      ↓
  Chunking (LangChain.js RecursiveCharacterTextSplitter)
      ↓
  Embeddingi (OpenRouter API / text-embedding-3-small)
      ↓
  Vectra LocalIndex (in-memory vector store)
      ↓
[przy każdym pytaniu użytkownika]
      ↓
  Embedding pytania
      ↓
  Wyszukiwanie top-K fragmentów w Vectra
      ↓
  Zbudowanie kontekstu z fragmentów + pytanie → API → odpowiedź
```

---

## Krok 1 — Instalacja zależności

```bash
npm install vectra @langchain/textsplitters
```

**Wyjaśnienie:**
- `vectra` — czysto TypeScriptowa in-memory baza wektorów, zero konfiguracji serwera
- `@langchain/textsplitters` — gotowy `RecursiveCharacterTextSplitter` do chunkingu

Embeddingi generuj przez istniejący OpenRouter API (endpoint `/api/v1/embeddings`, model `openai/text-embedding-3-small`) — nie potrzeba nowego klucza API.

---

## Krok 2 — Aktualizacja `config.ts`

Dodaj do interfejsu `Config` pola RAG:

```typescript
export interface Config {
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
  knowledgeBasePath: string;
  // RAG
  embeddingModel: string;   // np. "openai/text-embedding-3-small"
  chunkSize: number;        // np. 500
  chunkOverlap: number;     // np. 50
  topK: number;             // np. 4
}
```

Zaktualizuj też `config.json` dodając te cztery pola z sensownymi wartościami domyślnymi.

---

## Krok 3 — Nowy plik `src/chunker.ts`

Utwórz moduł odpowiedzialny za cięcie tekstu na fragmenty.

Użyj `RecursiveCharacterTextSplitter` z `@langchain/textsplitters`.

Eksportuj funkcję:

```typescript
export async function splitIntoChunks(text: string, chunkSize: number, chunkOverlap: number): Promise<string[]>
```

Powinna zwracać tablicę stringów (fragmentów).

---

## Krok 4 — Nowy plik `src/embeddings.ts`

Utwórz moduł do generowania embeddingów przez OpenRouter API.

OpenRouter obsługuje endpoint zgodny z OpenAI:
- URL: `${config.baseUrl}/embeddings`
- Body: `{ model: config.embeddingModel, input: string | string[] }`
- Odpowiedź: `{ data: [{ embedding: number[] }] }`

Eksportuj funkcje:

```typescript
export async function embedText(text: string, config: Config): Promise<number[]>
export async function embedBatch(texts: string[], config: Config): Promise<number[][]>
```

`embedBatch` powinien wysyłać żądania partiami (po 100 tekstów) żeby nie przekroczyć limitów API.

---

## Krok 5 — Nowy plik `src/vectorStore.ts`

Utwórz moduł opakowujący Vectra `LocalIndex`.

```typescript
import { LocalIndex } from 'vectra';
```

Vectra `LocalIndex` może działać w trybie in-memory jeśli jako ścieżkę podasz tymczasowy lub nieistniejący katalog (albo użyj folderu tymczasowego systemu). Przy starcie aplikacji indeks jest zawsze budowany od zera z pliku bazy wiedzy.

Eksportuj funkcje:

```typescript
export async function buildIndex(chunks: string[], embeddings: number[][], config: Config): Promise<LocalIndex>
export async function searchIndex(index: LocalIndex, queryEmbedding: number[], topK: number): Promise<string[]>
```

`buildIndex` powinien:
1. Stworzyć nowy `LocalIndex` w katalogu tymczasowym
2. Dodać każdy chunk z jego embeddingiem: `index.insertItem({ vector: embeddings[i], metadata: { text: chunks[i] } })`

`searchIndex` powinien:
1. Wywołać `index.queryItems(queryEmbedding, topK)`
2. Zwrócić tablicę stringów `item.item.metadata.text`

---

## Krok 6 — Modyfikacja `src/chat.ts`

To jest najważniejsza zmiana. Usuń podejście pełnego kontekstu i zastąp je RAG pipeline.

### Faza inicjalizacji (przed pętlą czatu)

Zastąp `loadKnowledgeBase` + system prompt blokiem:

```
1. Wczytaj plik bazy wiedzy (tak samo jak teraz — fs.readFileSync)
2. Podziel na fragmenty (chunker.splitIntoChunks)
3. Wygeneruj embeddingi dla wszystkich fragmentów (embeddings.embedBatch)
4. Zbuduj indeks wektorowy (vectorStore.buildIndex)
5. Wyświetl info ile fragmentów zaindeksowano
```

Usuń stały system message z treścią bazy wiedzy. Zamiast tego użyj krótkiego system message bez kontekstu, np.:
```
"You are a helpful assistant. Answer questions based only on the provided context. If the answer is not in the context, say so clearly."
```

### Faza odpowiedzi (wewnątrz pętli, po otrzymaniu pytania)

Przed dodaniem pytania użytkownika do historii:

```
1. Wygeneruj embedding pytania (embeddings.embedText)
2. Wyszukaj top-K fragmentów w indeksie (vectorStore.searchIndex)
3. Zbuduj string kontekstu z fragmentów (np. ponumerowane sekcje)
4. Stwórz tymczasową wiadomość user z kontekstem:
   "Context:\n{fragmenty}\n\nQuestion: {pytanie użytkownika}"
5. Wyślij tę wiadomość do API (nie oryginalne pytanie)
6. Do historii dodaj oryginalne pytanie (dla czytelności /history)
```

Nie przechowuj kontekstu RAG w historii — tylko oryginalne pytania i odpowiedzi. Kontekst jest generowany świeżo przy każdym pytaniu.

---

## Krok 7 — Aktualizacja `src/logger.ts` (opcjonalne)

Dodaj logowanie zdarzeń RAG:
- ile fragmentów zaindeksowano przy starcie
- ile fragmentów znaleziono dla danego pytania
- czas wyszukiwania (opcjonalnie)

---

## Weryfikacja poprawności implementacji

Po wdrożeniu sprawdź:

1. **Chunking działa** — dodaj tymczasowy `console.log` pokazujący liczbę fragmentów i przykładowy fragment
2. **Embeddingi działają** — sprawdź czy `embedText` zwraca tablicę liczb (np. 1536 wymiarów dla text-embedding-3-small)
3. **Wyszukiwanie działa** — dla pytania o temat z bazy wiedzy top-K powinien zawierać trafne fragmenty
4. **Odpowiedź jest lepsza** — model powinien odpowiadać precyzyjnie na podstawie fragmentów, a nie halucynować

---

## Kluczowe różnice względem projektu #1

| | Projekt #1 (pełny kontekst) | Projekt #2 (RAG) |
|---|---|---|
| Baza w prompcie | Cała naraz | Tylko trafne fragmenty (top-K) |
| Zużycie tokenów | Wysokie (stały koszt) | Niskie (proporcjonalne do K) |
| Skalowanie | Nie skaluje się (limit kontekstu) | Skaluje się na duże bazy |
| Trafność | Model może się "zgubić" w dużym tekście | Tylko istotne fragmenty |
| Złożoność | Prosta | Wymaga chunking + embeddingi + vector store |

---

## Uwagi implementacyjne

- Indeks buduj **jednorazowo przy starcie** aplikacji, nie przy każdym pytaniu
- `LocalIndex` z Vectra wymaga podania ścieżki do katalogu — użyj `os.tmpdir()` + unikalnej nazwy podkatalogu
- Przy `embedBatch` uważaj na limity rate-limitingu OpenRouter — dodaj opóźnienie między partiami jeśli baza jest duża
- Wartości domyślne `chunkSize: 500, chunkOverlap: 50, topK: 4` są dobrym punktem startowym
- `RecursiveCharacterTextSplitter` dzieli po `\n\n`, `\n`, ` ` — respektuje strukturę dokumentu
