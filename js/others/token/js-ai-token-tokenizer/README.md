# js-ai-token-tokenizer

Console-based AI chat application with token count preview before sending a message and a token usage summary after each response.

## Features

- **Token estimation before sending** — uses `tiktoken` locally to count tokens (full context: history + new message) before the API call
- **Confirmation prompt** — shows estimated token count and asks `Continue? (y/n)` before sending
- **Token summary after response** — displays estimated input, actual input, and actual output token counts
- **Conversation history** — full history is kept in memory and sent with each request
- **Session logs** — every session is saved to `logs/YYYY-MM-DD.log` in a readable format
- **Commands** — `/clear` resets history and console, `/exit` exits the app

## Conversation Flow

    Available commands:
      /clear  — clear the console and reset conversation history
      /exit   — exit the application

    You: Tell me a joke

    Estimated input tokens: 24
    Continue? (y/n): y

    Assistant: Why don't scientists trust atoms? Because they make up everything!

    Tokens — estimated input: 24 | actual input: 22 | output: 18

## Setup

**1. Clone the repository and install dependencies**

    npm install

**2. Configure the API key**

Copy `.env.example` to `.env` and fill in your OpenRouter API key:

    OPENROUTER_API_KEY=your_api_key_here

You can get a key at https://openrouter.ai/keys

**3. (Optional) Edit `config.json`** to change the model or parameters:

    {
      "model": "openai/gpt-4o",
      "maxTokens": 1024,
      "temperature": 0.7,
      "baseUrl": "https://openrouter.ai/api/v1"
    }

## Running

**Development** (no build step, uses `ts-node`):

    npm run dev

**Production** (compile first, then run):

    npm run build
    npm start

## Commands

| Command  | Action                                              |
|----------|-----------------------------------------------------|
| `/clear` | Clear the console and reset conversation history    |
| `/exit`  | Exit the application                                |

## Configuration

| Field         | Default                       | Description                        |
|---------------|-------------------------------|------------------------------------|
| `model`       | `openai/gpt-4o`               | OpenRouter model ID                |
| `maxTokens`   | `1024`                        | Maximum tokens per response        |
| `temperature` | `0.7`                         | Sampling temperature (0.0 – 2.0)   |
| `baseUrl`     | `https://openrouter.ai/api/v1`| API base URL                       |

## Logs

Each session is appended to `logs/YYYY-MM-DD.log`. Multiple sessions on the same day go into the same file.

Example log output:

    ╔══════════════════════════════════════════════════════╗
    ║  SESSION STARTED  09.04.2026, 14:32:01              ║
    ║  Model: openai/gpt-4o                               ║
    ╚══════════════════════════════════════════════════════╝

    [14:32:12] YOU
      Tell me a joke
      Estimated input tokens: 24
    [14:32:14] ASSISTANT
      Why don't scientists trust atoms? Because they make up everything!
      Tokens — estimated input: 24 | actual input: 22 | output: 18

    [14:32:20] ─── SESSION ENDED (user typed /exit) ───

The `logs/` directory is excluded from git via `.gitignore`.

## Project Structure

    src/
      index.ts       — entry point
      config.ts      — loads config.json and validates the API key
      api.ts         — OpenRouter API call, returns response and usage tokens
      tokenizer.ts   — tiktoken-based token estimation
      chat.ts        — main REPL loop with token preview flow
      logger.ts      — session logging to logs/YYYY-MM-DD.log
    config.json      — model and API configuration
    .env             — API key (not committed)
    .env.example     — API key template

## Requirements

- Node.js 18+
- OpenRouter account and API key
