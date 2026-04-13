# js-ai-file-remote-uploadthing

AI agent with access to [UploadThing](https://uploadthing.com) cloud storage via MCP, powered by OpenRouter API. The agent can upload, list, and manage files in the cloud instead of the local filesystem.

## Setup

**1. Install dependencies**

```bash
npm install
cd mcp/uploadthing-mcp && bun install
```

**2. Configure environment**

```bash
cp .env.example .env
```

Fill in both keys in `.env`:

```env
OPENROUTER_API_KEY=...
UPLOADTHING_TOKEN=...
```

Get your `UPLOADTHING_TOKEN` from the [UploadThing dashboard](https://uploadthing.com/dashboard).

**3. Configure model** *(optional)*

Edit `config.json` to change the model or other parameters:

```json
{
  "model": "openai/gpt-4o",
  "maxTokens": 1024,
  "temperature": 0.7,
  "baseUrl": "https://openrouter.ai/api/v1"
}
```

## Run

```bash
# Development (ts-node, no build step) — requires Bun for uploadthing-mcp
npm run dev

# Production
npm run build
npm start
```

> [Bun](https://bun.sh) must be installed — it is used to run the `uploadthing-mcp` server at startup.

## Usage

Type a message and press Enter. The agent will use UploadThing tools automatically when needed.

| Command    | Description               |
|------------|---------------------------|
| `/history` | Show conversation history |
| `/clear`   | Clear the console         |
| `/exit`    | Quit                      |

**Example prompts:**

- `Save this conversation to chat.txt`
- `List my uploaded files`
- `Delete the file with key <key>`
- `Upload this text and give me the public URL`

## Configuration

Edit `config.json` to change model, tokens, or temperature.

| Field         | Default                        | Description             |
|---------------|--------------------------------|-------------------------|
| `model`       | `openai/gpt-4o`                | OpenRouter model ID     |
| `maxTokens`   | `1024`                         | Max tokens per response |
| `temperature` | `0.7`                          | Sampling temperature    |
| `baseUrl`     | `https://openrouter.ai/api/v1` | API base URL            |

## UploadThing tools

The agent uses [uploadthing-mcp](./mcp/uploadthing-mcp/) — an MCP server that proxies requests to the UploadThing API. It starts automatically on port `3000` when the app launches.

| Tool           | Description                                                  |
|----------------|--------------------------------------------------------------|
| `upload_files` | Upload files to UploadThing (base64-encoded, 1–10 per call)  |
| `list_files`   | List uploaded files with pagination, or get info by file key |
| `manage_files` | Delete, rename, update ACL, or get a signed URL for a file   |

### How file saving works

When asked to save a file, the agent:
1. Encodes the content as raw base64
2. Calls `upload_files` with the base64 content, file name, and MIME type
3. Returns the public URL of the uploaded file

## Architecture

```
src/index.ts          — entry point
src/chat.ts           — REPL loop, system prompt, tool callbacks
src/api.ts            — OpenRouter API calls with tool-use loop
src/mcp-client.ts     — stdio McpClient (files-mcp) + HttpMcpClient (uploadthing-mcp)
src/config.ts         — config loader with env validation
mcp/uploadthing-mcp/  — HTTP MCP server for UploadThing (Hono + StreamableHTTP)
mcp/files-mcp/        — stdio MCP server for local filesystem (unused by default)
```

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
