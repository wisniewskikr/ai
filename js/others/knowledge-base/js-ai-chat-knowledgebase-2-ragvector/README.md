# js-ai-chat — Knowledge Base (RAG + Vector Search)

AI chat app using OpenRouter API with a RAG (Retrieval-Augmented Generation) pipeline. Instead of loading the entire knowledge base into context, the app splits it into chunks, indexes them as embeddings in an in-memory vector store (Vectra), and retrieves only the most relevant fragments per question (Project 2 from the knowledge base series).

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

| Field               | Default                          | Description                                            |
|---------------------|----------------------------------|--------------------------------------------------------|
| `model`             | `openai/gpt-4o`                  | OpenRouter model ID for chat                           |
| `maxTokens`         | `1024`                           | Max tokens per response                                |
| `temperature`       | `0.7`                            | Sampling temperature                                   |
| `baseUrl`           | `https://openrouter.ai/api/v1`   | API base URL                                           |
| `knowledgeBasePath` | `data/data.txt`                  | Path to knowledge base file (relative to project root) |
| `embeddingModel`    | `openai/text-embedding-3-small`  | OpenRouter model ID for embeddings                     |
| `chunkSize`         | `500`                            | Max characters per chunk                               |
| `chunkOverlap`      | `50`                             | Overlap between adjacent chunks                        |
| `topK`              | `4`                              | Number of chunks retrieved per question                |

## How It Works

At startup the app builds a RAG index from the knowledge base file:

```
Knowledge base file
      ↓
  Chunking (RecursiveCharacterTextSplitter)
      ↓
  Embeddings (OpenRouter — text-embedding-3-small)
      ↓
  Vectra LocalIndex (in-memory vector store)
```

For each user question:

```
Question
      ↓
  Embedding of question
      ↓
  Top-K semantic search in Vectra
      ↓
  Context built from retrieved chunks + question → API → answer
```

Only original questions and answers are kept in conversation history. RAG context is generated fresh for every question.

## Knowledge Base

Point `knowledgeBasePath` in `config.json` to any plain-text file (relative to the project root). The file is chunked and indexed automatically on startup.

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`, `RAG`).
