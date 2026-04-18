# js-ai-chat

Simple AI chat app using OpenRouter API.

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
| `model`       | `openai/gpt-4o`                  | OpenRouter model ID     |
| `maxTokens`   | `1024`                           | Max tokens per response |
| `temperature` | `0.7`                            | Sampling temperature    |
| `baseUrl`     | `https://openrouter.ai/api/v1`   | API base URL            |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
