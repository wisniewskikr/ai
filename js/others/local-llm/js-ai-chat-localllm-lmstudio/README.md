# js-ai-chat

Simple AI chat app using a local LLM via [LM Studio](https://lmstudio.ai).

## LM Studio — Starting the Local Server

The steps below show how to start a local server with the **qwen3-4b-alpaca-chatwithme** model.

1. Download and install [LM Studio](https://lmstudio.ai)
2. Open LM Studio
3. Go to the **Discover** tab (magnifying glass icon on the left) and search for `qwen3-4b-alpaca-chatwithme`
4. Click **Download** next to your preferred variant (e.g. Q4_K_M — a good balance of quality and size)
5. After downloading, go to the **Local Server** tab (`<->` icon on the left)
6. From the **Select a model to load** dropdown, choose `qwen3-4b-alpaca-chatwithme`
7. Click **Start Server** — the server will start at `http://localhost:1234`
8. Make sure `config.json` contains:
   ```json
   {
     "model": "qwen3-4b-alpaca-chatwithme",
     "baseUrl": "http://localhost:1234/v1"
   }
   ```

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

| Field         | Default                        | Description                     |
|---------------|--------------------------------|---------------------------------|
| `model`       | `qwen3-4b-alpaca-chatwithme`   | Model identifier from LM Studio |
| `maxTokens`   | `1024`                         | Max tokens per response         |
| `temperature` | `0.7`                          | Sampling temperature            |
| `baseUrl`     | `http://localhost:1234/v1`     | LM Studio server URL            |

> **Tip:** The exact model identifier is shown in LM Studio in the loaded model's info panel (the **Model identifier** field). It must exactly match the `model` value in `config.json`.

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
