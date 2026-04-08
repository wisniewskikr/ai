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

- Type a message and press Enter to chat.
- Type `/history` to display the conversation history.
- Type `exit` (or the configured command) to quit.

## Configuration

Edit `config.json` to change model, tokens, temperature, or the exit command/message.

| Field          | Default                                      | Description                    |
|----------------|----------------------------------------------|--------------------------------|
| `model`        | `meta-llama/llama-3.1-8b-instruct:free`      | OpenRouter model ID            |
| `maxTokens`    | `1024`                                       | Max tokens per response        |
| `temperature`  | `0.7`                                        | Sampling temperature           |
| `baseUrl`      | `https://openrouter.ai/api/v1`               | API base URL                   |
| `exitCommand`  | `exit`                                       | Keyword to quit                |
| `exitMessage`  | `Type 'exit' to quit the chatbot.`           | Shown at startup               |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
