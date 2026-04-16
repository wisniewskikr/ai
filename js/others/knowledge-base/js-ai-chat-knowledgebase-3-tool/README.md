# js-ai-chat — Knowledge Base (Tools + SQLite)

AI chat app using OpenRouter API with a knowledge base stored in SQLite. The model queries the database on demand via function calling (Project 3 from the knowledge base series).

## Setup

```bash
npm install
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
npm run seed
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
|-------------|---------------------------------------|
| `/history`  | Show conversation history          |
| `/clear`    | Clear the console                  |
| `/exit`     | Quit the chatbot                   |

## Configuration

Edit `config.json` to change model, tokens, temperature, or seed data path.

| Field           | Default                        | Description                                          |
|-----------------|--------------------------------|------------------------------------------------------|
| `model`         | `openai/gpt-4o`                | OpenRouter model ID                                  |
| `maxTokens`     | `1024`                         | Max tokens per response                              |
| `temperature`   | `0.7`                          | Sampling temperature                                 |
| `baseUrl`       | `https://openrouter.ai/api/v1` | API base URL                                         |
| `seedDataPath`  | `data/data.txt`                | Path to seed data file (relative to project root)    |

## Knowledge Base

The knowledge base is stored in `data/knowledge.db` (SQLite). At startup the model does **not** receive the full knowledge base — instead it receives tool definitions and decides when and what to query.

### Available tools

| Tool               | Description                                      |
|--------------------|--------------------------------------------------|
| `search_knowledge` | Full-text search across all entries              |
| `list_topics`      | List all topic names available in the database   |
| `get_entry_by_id`  | Fetch a single entry by its numeric ID           |

### Seeding the database

The seed script reads the file specified by `seedDataPath` in `config.json`, splits it into lines, and inserts each line as a separate entry:

```bash
npm run seed
```

To use a different knowledge base, update `seedDataPath` in `config.json` to point to any plain-text file (one fact per line), then re-run `npm run seed`.

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
