# js-ai-observability-langfuse

Simple AI chat app using OpenRouter API with observability powered by Langfuse.

## What is Langfuse?

[Langfuse](https://langfuse.com) is an open-source platform for observing and debugging LLM applications. It enables tracing model calls (traces, generations), monitoring costs and tokens, analyzing response quality, and building datasets for evaluation. Data is visible in the Langfuse dashboard in real time.

In this project, each chat session creates a single **trace**, and every model API call is recorded as a **generation** with full context: input messages, response, model, parameters, and token usage.

## Setup

```bash
npm install
cp .env.example .env
# Fill in OPENROUTER_API_KEY and Langfuse keys in .env
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

## Langfuse — Environment Variables

Add to `.env`:

```env
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

You can find the keys in your project settings at [cloud.langfuse.com](https://cloud.langfuse.com).

## Connecting Multiple Projects to Langfuse

Each Langfuse project has its own pair of API keys, so no separate API instances are needed. Simply create a new project in the Langfuse dashboard for each application and use the corresponding keys in each app's `.env`. Traces, generations, and statistics are automatically separated per project.

**Steps:**

1. Log in at [cloud.langfuse.com](https://cloud.langfuse.com)
2. Click the project name in the top-left corner → **New project**
3. Give it a name (e.g. `my-chat-app`, `my-rag-app`)
4. Go to **Settings → API Keys** and copy the keys
5. Paste the keys into the `.env` of the corresponding application

**Example:**

App A `.env`:
```env
LANGFUSE_PUBLIC_KEY=pk-lf-aaa...
LANGFUSE_SECRET_KEY=sk-lf-aaa...
```

App B `.env`:
```env
LANGFUSE_PUBLIC_KEY=pk-lf-bbb...
LANGFUSE_SECRET_KEY=sk-lf-bbb...
```

Each project gets its own dashboard with independent traces, metrics, and statistics. `LANGFUSE_BASE_URL` remains the same for all projects.
