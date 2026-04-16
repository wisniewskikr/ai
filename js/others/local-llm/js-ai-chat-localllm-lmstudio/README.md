# js-ai-chat

Simple AI chat app using a local LLM via [LM Studio](https://lmstudio.ai).

## Prerequisites

1. Install and open LM Studio
2. Download any model (e.g. Llama 3, Mistral, Phi)
3. Go to **Local Server** tab and click **Start Server** (default port: 1234)

## Setup

```bash
npm install
```

No API key required — LM Studio runs entirely locally.

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

| Command     | Description               |
|-------------|---------------------------|
| `/history`  | Show conversation history |
| `/clear`    | Clear the console         |
| `/exit`     | Quit the chatbot          |

## Configuration

Edit `config.json` to change model, tokens, or temperature.

| Field         | Default                    | Description                     |
|---------------|----------------------------|---------------------------------|
| `model`       | `local-model`              | Model identifier from LM Studio |
| `maxTokens`   | `1024`                     | Max tokens per response         |
| `temperature` | `0.7`                      | Sampling temperature            |
| `baseUrl`     | `http://localhost:1234/v1` | LM Studio server URL            |

> **Tip:** The exact model identifier can be found in LM Studio under the loaded model's info panel. Use it as the `model` value in `config.json`.

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
