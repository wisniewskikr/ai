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

## Upgrading to neural embeddings

The similarity search lives entirely in `src/rag.ts`. To replace bag-of-words with neural embeddings, swap the `buildVector` + `cosineSimilarity` logic in that file with any embedding API call. Everything else stays the same.
