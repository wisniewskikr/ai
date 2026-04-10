# js-ai-rag

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
