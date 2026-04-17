# js-ai-chat — Knowledge Base (RAG Hybrid)

AI chat app using OpenRouter API with a hybrid RAG (Retrieval-Augmented Generation) pipeline. The app splits the knowledge base into chunks, indexes them in an in-memory hybrid store (Orama), and retrieves the most relevant fragments per question using both semantic vector search and full-text search simultaneously (Project 4 from the knowledge base series).

## Setup

```bash
npm install
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
```

## Run

```bash
# Development (ts-node, no build step)
npm run dev

# Production
npm run build
npm start
```

## Usage

Type a message and press Enter to chat. Available commands:

| Command     | Description                        |
|-------------|-------------------------------------|
| `/history`  | Show conversation history           |
| `/clear`    | Clear the console                   |
| `/exit`     | Quit the chatbot                    |

## Configuration

Edit `config.json` to change model, tokens, temperature, or RAG parameters.

| Field                | Default                          | Description                                            |
|----------------------|----------------------------------|--------------------------------------------------------|
| `model`              | `openai/gpt-4o`                  | OpenRouter model ID for chat                           |
| `maxTokens`          | `1024`                           | Max tokens per response                                |
| `temperature`        | `0.7`                            | Sampling temperature                                   |
| `baseUrl`            | `https://openrouter.ai/api/v1`   | API base URL                                           |
| `knowledgeBasePath`  | `data/data.txt`                  | Path to knowledge base file (relative to project root) |
| `embeddingModel`     | `openai/text-embedding-3-small`  | OpenRouter model ID for embeddings                     |
| `embeddingDimension` | `1536`                           | Vector dimension — must match the embedding model      |
| `chunkSize`          | `500`                            | Max characters per chunk                               |
| `chunkOverlap`       | `50`                             | Overlap between adjacent chunks                        |
| `topK`               | `4`                              | Number of chunks retrieved per question                |
| `similarity`         | `0.1`                            | Minimum cosine similarity for vector search (0–1)      |
| `threshold`          | `0`                              | Minimum fraction of query terms that must match in full-text search (0–1) |

`embeddingDimension` by model: `text-embedding-3-small` → 1536, `text-embedding-3-large` → 3072, `text-embedding-ada-002` → 1536.

**`similarity`** — Orama's default is 0.8, which is too strict for small knowledge bases and causes relevant chunks to be filtered out. Lower values (e.g. 0.1) return more candidates and let the ranking decide.

**`threshold`** — Orama's default is 1, meaning all query tokens must be present in a chunk (AND logic). Setting it to 0 switches to OR logic — a chunk matches if it contains any query token. Use values between 0 and 1 to require a fraction of terms (e.g. 0.5 = at least half).

## How It Works

At startup the app builds a hybrid RAG index from the knowledge base file:

```
Knowledge base file
      ↓
  Chunking (RecursiveCharacterTextSplitter)
      ↓
  Embeddings (OpenRouter — text-embedding-3-small)
      ↓
  Orama hybrid index (in-memory, no server required)
```

For each user question:

```
Question
      ↓
  Embedding of question
      ↓
  Orama hybrid search:
    ├── vector search   (semantic similarity)
    └── full-text search (keyword matching)
      ↓
  Top-K results (merged natively by Orama)
      ↓
  Context + question → API → answer
```

Only original questions and answers are kept in conversation history. RAG context is generated fresh for every question.

### How the model receives context

The model does not use any tool to query the index — all retrieval happens in your code **before** the API call. The model simply receives a regular user message with the context already injected:

```
User question: "What are Joe's hobbies?"
         ↓
1. Embed the question → vector [0.023, -0.441, 0.891, ...]
         ↓
2. Orama hybrid search → top-4 most relevant chunks
         ↓
3. Build a user message:

   "Context:
    [1] Joe enjoys hiking and photography...
    [2] He also plays guitar...

    Question: What are Joe's hobbies?"
         ↓
4. Send to API → answer
```

## Why Hybrid Search

Pure vector search finds semantically similar chunks even when they share no exact words — but it can miss chunks that contain the exact term from the question. Pure keyword search finds exact matches — but fails on paraphrasing or synonyms. Hybrid search combines both:

| Scenario | Vector only | Keyword only | Hybrid |
|---|---|---|---|
| Question uses different words than the text ("pastime" vs "hobby") | found | missed | found |
| Question quotes the exact phrase from the text | found | found | found |
| Rare proper noun (name, acronym, code) | may miss | found | found |
| Vague or conceptual question | found | missed | found |

In practice, hybrid search consistently retrieves more relevant context, which leads to more accurate answers — especially in knowledge bases that mix narrative text with structured data, names, or technical terms.

Orama handles both search modes in a single library with no HTTP server or Docker required. All data stays in-process in `node_modules`.

## Knowledge Base

Point `knowledgeBasePath` in `config.json` to any plain-text file (relative to the project root). The file is chunked and indexed automatically on startup.

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
