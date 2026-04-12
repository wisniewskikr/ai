# js-ai-rag-json-embeddings

Personal knowledge RAG chat using **JSON embeddings** — embeddings are computed once and stored in a JSON file, so the knowledge base never needs to be re-embedded between sessions.

## How it works

```
BUILD MODE (once):
  knowledge.txt → split by line → embed with neural model → save to embeddings.json

CHAT MODE (every session):
  embeddings.json → load vectors (no model needed for knowledge)
  user question   → embed with neural model → find closest lines (cosine similarity)
                                           ↓
                 → inject as context → LLM generates answer
```

## JSON embeddings vs text neutral embeddings

This project uses **JSON embeddings**. The alternative approach — **text neutral embeddings** — computes vectors for all knowledge chunks on every application start.

|                              | Text neutral embeddings | JSON embeddings        |
|------------------------------|-------------------------|------------------------|
| Knowledge vector computation | every startup           | once (build mode)      |
| ML model needed at startup   | yes                     | no                     |
| Startup time                 | slower                  | fast (file read only)  |
| Knowledge base format        | plain `.txt`            | `.json` with vectors   |
| After changing knowledge     | restart is enough       | must re-run build      |

### Main advantage of JSON embeddings

Embeddings are computed only once, during the build step. This is especially important for **large knowledge bases** — embedding thousands of lines with a neural model can take tens of seconds or even minutes. With JSON embeddings, that cost is paid once; every subsequent chat session starts instantly by reading the pre-computed file.

## Setup

```bash
npm install
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
```

## Fill in your knowledge base

Edit `data/knowledge.txt` — one fact per line:

```
My name is Krzysztof.
I live in Warsaw, Poland.
I work as a Java developer.
I have been programming for 10 years.
I enjoy hiking and photography.
```

## Run

### Step 1 — Build embeddings (once, or after editing knowledge.txt)

```bash
# Development
npm run dev:build-embeddings

# Production
npm run build
npm run start:build-embeddings
```

This reads `data/knowledge.txt`, embeds each line and saves the vectors to `data/embeddings.json`.

On the first run the embedding model (`all-MiniLM-L6-v2`, ~23 MB) is downloaded and cached locally.

### Step 2 — Start the chat

```bash
# Development
npm run dev:chat

# Production
npm run start:chat
```

### Or: interactive mode (no argument)

```bash
npm run dev
# Select mode:
#   1. Build embeddings  (reads knowledge.txt, saves embeddings.json)
#   2. Run chat          (loads embeddings.json, starts conversation)
```

## Usage

Type a question and press Enter. Available commands:

| Command     | Description               |
|-------------|---------------------------|
| `/history`  | Show conversation history |
| `/clear`    | Clear the console         |
| `/exit`     | Quit                      |

## Configuration

Edit `config.json`:

| Field            | Default                        | Description                          |
|------------------|--------------------------------|--------------------------------------|
| `model`          | `openai/gpt-4o`                | OpenRouter model ID                  |
| `maxTokens`      | `1024`                         | Max tokens per response              |
| `temperature`    | `0.7`                          | Sampling temperature                 |
| `baseUrl`        | `https://openrouter.ai/api/v1` | API base URL                         |
| `knowledgeFile`  | `data/knowledge.txt`           | Path to your knowledge file          |
| `embeddingsFile` | `data/embeddings.json`         | Path to the pre-computed embeddings  |
| `topK`           | `3`                            | Number of chunks injected as context |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).

## Similarity search: neutral embeddings

Each line from `knowledge.txt` and each user question are encoded into a 384-dimensional dense vector using the `Xenova/all-MiniLM-L6-v2` model. The chunks with the highest cosine similarity to the question are injected as context.

Unlike bag-of-words, this approach captures **semantic meaning**, so queries work even when they share no words with the stored facts:

| Question | Matching chunk | Works? |
|---|---|---|
| `"What is my name?"` | `"My name is Krzysztof Wisniewski."` | yes |
| `"Where do I live?"` | `"I live in Szczecin, Poland."` | yes |
| `"What do I enjoy in my spare time?"` | `"My hobbies are traveling and dancing."` | yes — no shared words |
| `"What's my diet?"` | `"I'm vegan."` | yes — no shared words |
| `"Where do I reside?"` | `"I live in Szczecin."` | yes — `reside` ≠ `live` |
| `"What's my profession?"` | `"I'm Java Developer."` | yes — no shared words |

### Example: what actually gets sent to the LLM

Question: `"Where do I reside?"`

```
Cosine similarity against each line (semantic, no word overlap needed):
  [0] My name is Krzysztof Wisniewski.          → score: 0.21
  [1] I'm Java Developer.                        → score: 0.19
  [2] I live in Szczecin, Poland.                → score: 0.71  ✓
  [3] I'm vegan. My favorite dish is dumplings.  → score: 0.15
  [4] My hobbies are traveling and dancing.      → score: 0.18

topK=3 → lines [2], [0], [1] are selected
```

Prompt sent to the LLM:
```
Relevant context:
I live in Szczecin, Poland.
My name is Krzysztof Wisniewski.
I'm Java Developer.

Question: Where do I reside?
```

### Two levels of filtering

**Level 1 — RAG (semantic):**
Encodes both the question and all chunks into dense vectors, then returns the top-K by cosine similarity. Understands meaning — no word overlap required.

**Level 2 — LLM (intelligent):**
Receives the selected lines as context and decides which ones are actually useful for the answer. If a line is irrelevant, the LLM simply ignores it.

This means `topK` does not need to be perfect. The LLM is smart enough to filter out noise in the context — so it is safe to pass a few extra lines rather than risk missing the right one.

## Models

Two AI models are used, each with a distinct role:

| Model | Role | Runs |
|---|---|---|
| `Xenova/all-MiniLM-L6-v2` | Encodes text into 384-dim vectors; finds top-K chunks by cosine similarity | locally |
| LLM (`gpt-4o` etc.) | Receives question + top-K chunks as context; generates the answer | OpenRouter API |

The LLM does not explicitly validate chunks — it simply ignores irrelevant ones while answering.
