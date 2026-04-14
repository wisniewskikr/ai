# js-ai-file-remote-uploadthing

AI agent with access to [UploadThing](https://uploadthing.com) cloud storage via MCP, powered by OpenRouter API. The agent can upload, list, and manage files in the cloud instead of the local filesystem.

## Setup

**1. Install dependencies**

```bash
npm install
cd mcp/uploadthing-mcp && npm install
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
# Development (ts-node, no build step)
npm run dev

# Production
npm run build
npm start
```

> Requires **Node.js ≥ 20**. Bun is no longer required — the `uploadthing-mcp` server is started automatically using the local `tsx` package.

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
- `Delete the file chat.txt`
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

The agent uses [uploadthing-mcp](./mcp/uploadthing-mcp/) — an MCP server that proxies requests to the UploadThing API. It starts automatically on a free port (3000–3099) when the app launches.

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

Uploaded files are accessible in the [UploadThing dashboard](https://uploadthing.com/).

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

### How uploadthing-mcp is started

The main app spawns `uploadthing-mcp` as a detached child process via `tsx` (installed locally in `mcp/uploadthing-mcp/node_modules`). A free port in the range 3000–3099 is selected automatically to avoid conflicts. The process is unref'd so it does not block the parent's event loop.

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
