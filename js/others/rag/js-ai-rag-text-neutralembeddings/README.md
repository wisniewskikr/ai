# js-ai-rag-text-neutralembeddings

Personal knowledge RAG chat. Fill `data/knowledge.txt` with facts about yourself — the assistant answers questions using that file as its knowledge base.

## How it works

```
knowledge.txt → split by line → embed with neural model
                                       ↓
user question → embed with neural model → find closest lines (cosine similarity)
                                       ↓
              → inject as context → LLM generates answer
```

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

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

On the first run the embedding model (`all-MiniLM-L6-v2`, ~23 MB) is downloaded and cached locally. Subsequent runs use the cache.

## Usage

Type a question and press Enter. Available commands:

| Command     | Description                  |
|-------------|------------------------------|
| `/history`  | Show conversation history    |
| `/clear`    | Clear the console            |
| `/exit`     | Quit                         |

## Configuration

Edit `config.json`:

| Field           | Default                        | Description                          |
|-----------------|--------------------------------|--------------------------------------|
| `model`         | `openai/gpt-4o`                | OpenRouter model ID                  |
| `maxTokens`     | `1024`                         | Max tokens per response              |
| `temperature`   | `0.7`                          | Sampling temperature                 |
| `baseUrl`       | `https://openrouter.ai/api/v1` | API base URL                         |
| `knowledgeFile` | `data/knowledge.txt`           | Path to your knowledge file          |
| `topK`          | `3`                            | Number of chunks injected as context |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).

## Similarity search: neutral embeddings

The implementation uses **neutral embeddings** (sentence-transformers) for retrieval — each line from `knowledge.txt` and each user question are encoded into a 384-dimensional dense vector using the `Xenova/all-MiniLM-L6-v2` model. The chunks with the highest cosine similarity to the question are injected as context.

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
