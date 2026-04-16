# js-ai-chat — Knowledge Base (Full Context)

AI chat app using OpenRouter API with a knowledge base loaded into the model's context window (Project 1 from the knowledge base series).

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
|-------------|------------------------------------|
| `/history`  | Show conversation history          |
| `/clear`    | Clear the console                  |
| `/exit`     | Quit the chatbot                   |

## Configuration

Edit `config.json` to change model, tokens, or temperature.

| Field         | Default                          | Description             |
|---------------|----------------------------------|-------------------------|
| `model`             | `openai/gpt-4o`                  | OpenRouter model ID               |
| `maxTokens`         | `1024`                           | Max tokens per response           |
| `temperature`       | `0.7`                            | Sampling temperature              |
| `baseUrl`           | `https://openrouter.ai/api/v1`   | API base URL                      |
| `knowledgeBasePath` | `data/data.txt`                  | Path to knowledge base file (relative to project root) |

## Knowledge Base

At startup the app reads the file specified by `knowledgeBasePath` and injects its content into the system prompt. The model answers questions based solely on that data.

To use a different knowledge base, point `knowledgeBasePath` in `config.json` to any plain-text file (relative to the project root).

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
