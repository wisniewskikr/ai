# Project Requirements

## Goal

Build a RAG (Retrieval-Augmented Generation) demo project in JavaScript.
The chat answers questions about the user based on a personal knowledge base stored in a plain text file.

## Reference Project

Base the structure and conventions on:
https://github.com/wisniewskikr/ai/tree/main/js/others/chat/js-ai-chat

**Key constraint**: Change as little as possible in the reference project.
RAG is additive — layer it on top without rewriting existing logic.
The interactive chat loop already exists there; keep it as-is.

## Functional Requirements

- The user fills `data/knowledge.txt` with facts about themselves.
- The chat retrieves relevant facts from that file and uses them to answer questions.
- The knowledge file path must be configurable via `config.json`.

## Embeddings

- Use local embeddings via `@xenova/transformers` — no external API key required, zero cost.
- Embeddings are computed locally on CPU at runtime.

## Language

- All conversation (user input and bot responses) is in English.
- Fallback when no relevant context found: `"I don't have information about that."`

## Chunking Strategy

- Split `knowledge.txt` line by line — each non-empty line is one chunk.
- Example format:
  ```
  My name is Krzysztof.
  I live in Warsaw.
  I work as a Java developer.
  ```

## Non-Functional Requirements

- **Code style**: Write as Linus Torvalds would — clear, direct, no over-engineering.
  Strong emphasis on readability and long-term maintainability.
- **Logs**: User-friendly, timestamped logs written to the `logs/` directory.
- **Documentation**: Include a `README.md` explaining setup and usage.

## File Structure (expected)

```
js-ai-rag/
  data/
    knowledge.txt       <- empty, to be filled by user
  logs/                 <- runtime logs
  src/
    ...                 <- source files
  config.json           <- model, knowledgeFile path, and other settings
  package.json
  README.md
  AGENTS.md             <- this file
```

## config.json (expected keys)

```json
{
  "model": "...",
  "embeddingModel": "...",
  "knowledgeFile": "data/knowledge.txt",
  "maxTokens": 1024,
  "temperature": 0.7,
  "baseUrl": "..."
}
```
