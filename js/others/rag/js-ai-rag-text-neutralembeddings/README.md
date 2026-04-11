# js-ai-rag-text-neutralembeddings

Personal knowledge RAG chat. Fill `data/knowledge.txt` with facts about yourself — the assistant answers questions using that file as its knowledge base.

## How it works

```
knowledge.txt → split by line → build word vectors
                                       ↓
user question → find closest lines (cosine similarity)
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

## Similarity search: bag-of-words

The current implementation uses **bag-of-words** cosine similarity — no external dependencies, no API calls, no model downloads.

Each line from `knowledge.txt` and each user question are converted to a word-frequency vector. The chunks with the highest cosine similarity to the question are injected as context.

This works well when the question shares vocabulary with the stored facts:

| Question | Matching chunk | Works? |
|---|---|---|
| `"What is my name?"` | `"My name is Krzysztof Wisniewski."` | yes — shares `name` |
| `"Where do I live?"` | `"I live in Szczecin, Poland."` | yes — shares `live` |

It **fails** when the question uses different words with the same meaning:

| Question | Matching chunk | Works? |
|---|---|---|
| `"What do I enjoy in my spare time?"` | `"My hobbies are traveling and dancing."` | no — no shared words |
| `"What's my diet?"` | `"I'm vegan."` | no — no shared words |
| `"Where do I reside?"` | `"I live in Szczecin."` | no — `reside` ≠ `live` |
| `"What's my profession?"` | `"I'm Java Developer."` | no — no shared words |

### Example: what actually gets sent to the LLM

Question: `"What is my name?"`

```
Cosine similarity against each line:
  [0] My name is Krzysztof Wisniewski.          → score: 0.63  ✓
  [1] I'm Java Developer.                        → score: 0.00
  [2] I live in Szczecin, Poland.                → score: 0.00
  [3] I'm vegan. My favorite dish is dumplings.  → score: 0.18
  [4] My hobbies are traveling and dancing.      → score: 0.27

topK=3 → lines [0], [4], [3] are selected
```

Prompt sent to the LLM:
```
Relevant context:
My name is Krzysztof Wisniewski.
My hobbies are traveling and dancing.
I'm vegan. My favorite dish is dumplings with mushrooms.

Question: What is my name?
```

Lines `[1]` and `[2]` are **never sent** — their score is 0.

To see only the single best match, set `topK: 1` in `config.json`.

### Two levels of filtering

Retrieving the right answer involves two independent steps:

**Level 1 — RAG (mechanical):**
Drops lines with score=0 (no shared words), returns the top-K remaining lines. Pure math — no understanding of meaning.

**Level 2 — LLM (intelligent):**
Receives the selected lines as context and decides which ones are actually useful for the answer. If a line is irrelevant, the LLM simply ignores it.

This means `topK` does not need to be perfect. The LLM is smart enough to filter out noise in the context — so it is safe to pass a few extra lines rather than risk missing the right one.
