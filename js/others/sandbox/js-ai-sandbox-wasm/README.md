# js-ai-sandbox-wasm

AI agent with local filesystem access (OpenRouter API) demonstrating a **WebAssembly (WASM) sandbox**.

## What is a WASM sandbox?

WebAssembly is a binary format executed in an isolated environment — a WASM module has **no direct access** to the filesystem, network, or other host resources. Every I/O operation must go through **host functions** — functions explicitly provided by the host (here: Node.js).

```
WASM wants to write a file
       │
       ▼
hostWriteFile(path, content)   ← the only I/O path
       │
       ▼
Node.js checks the path:
   C:/workspace/... → write allowed  ✓
   C:/tmp/...       → write blocked  ✗
```

The host controls what WASM is allowed to do. That is the sandbox boundary.

> **Simply put:** WASM is a robot with no hands. Node.js is a teacher who checks where the robot wants to put something. Allowed drawer (`C:/workspace`) — she puts it away. Wrong drawer — she refuses. The rules are written by the developer, in code.

In this project, the WASM module (written in **AssemblyScript**) stores the chat history in its own isolated memory and can only write it to disk through `hostWriteFile` — and only if the path points to `C:/workspace`.

## Tech stack

| Layer | Technology |
|---|---|
| Host / agent | Node.js + TypeScript |
| AI model API | OpenRouter |
| WASM module | AssemblyScript (`assembly/index.ts`) |
| WASM loader | `@assemblyscript/loader` |
| File tools | MCP server (`mcp/files-mcp`) |

## Architecture

```
Node.js Host (TypeScript)
│
├── src/index.ts         — entry point
├── src/chat.ts          — chat loop (CLI)
├── src/api.ts           — OpenRouter API calls
├── src/wasmBridge.ts    — loads WASM, provides host functions, enforces sandbox
├── src/mcp-client.ts    — MCP client for agent file tools
└── src/logger.ts        — session logs to file

WASM Module (AssemblyScript → .wasm)
└── assembly/index.ts
    ├── stores chat history in isolated WASM memory
    ├── exports: addMessage(), getHistoryJson(), clearHistory(), saveHistory()
    └── NO direct disk access (no `import fs`)
```

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Build the WASM module** (AssemblyScript → `.wasm`)

```bash
npm run build:wasm
```

**3. Build the MCP server** (requires [Bun](https://bun.sh))

```bash
npm run build:mcp
```

> If Bun is not installed, the app will attempt to run `files-mcp` via `bun run src/index.ts` at startup.

**4. Configure environment**

```bash
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
```

**5. Configure workspace**

Edit `config.json` and set `fsRoot` — the directory the agent should have access to:

```json
{
  "fsRoot": "C:\\workspace"
}
```

## Running

```bash
# Development (ts-node, no build step)
npm run dev

# Production
npm run build
npm start

# Build everything at once (WASM + TypeScript)
npm run build:all
```

## Usage

Type a message and press Enter. The agent will use file tools automatically when needed.

| Command    | Description |
|------------|-------------|
| `/history` | Show conversation history (including WASM memory message count) |
| `/save`    | Save chat history via WASM sandbox to `C:/workspace/history.json` |
| `/clear`   | Clear the console |
| `/exit`    | Quit |

**Example prompts:**

- `Save this conversation to chat.txt`
- `Read the file notes.md`
- `List all files in the workspace`
- `Search for files containing "TODO"`

## Configuration

Edit `config.json` to change the model, tokens, temperature, or workspace path.

| Field | Default | Description |
|---|---|---|
| `model` | `openai/gpt-4o` | OpenRouter model ID |
| `maxTokens` | `1024` | Max tokens per response |
| `temperature` | `0.7` | Sampling temperature |
| `baseUrl` | `https://openrouter.ai/api/v1` | API base URL |
| `fsRoot` | `C:\\workspace` | Agent workspace directory |

## WASM sandbox — details

| Concept | Where visible in code |
|---|---|
| No disk access | `assembly/index.ts` — no `import fs` |
| Sandbox boundary (host functions) | `src/wasmBridge.ts` — `hostWriteFile` with path validation |
| Isolated WASM memory | own `ArrayBuffer`, separate from host memory |
| Path enforcement | host rejects paths outside `C:/workspace`, returns `-1` |
| Runtime export | `asconfig.json` → `exportRuntime: true` (exposes `__getString`, `__pin`) |

## Agent file tools

The agent uses [files-mcp](./mcp/files-mcp/) — a sandboxed MCP server that restricts all file operations to the configured `fsRoot`.

| Tool | Description |
|---|---|
| `fs_read` | Read files or list directories |
| `fs_write` | Create or update files |
| `fs_search` | Find files by name or content |
| `fs_manage` | Delete, rename, move, copy, mkdir |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
