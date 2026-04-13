# js-ai-sandbox-docker

AI agent with local filesystem access, powered by OpenRouter API. The agent can read, write, search, and manage files within a configured workspace directory.

## Sandbox: two layers

1. **MCP (files-mcp)** — All filesystem tools are scoped to a single root directory (`fsRoot` / `FS_ROOT`). Paths outside that root are rejected by the server.
2. **Docker (optional)** — The chat app and MCP run inside a container. Only the host directory you mount (by default `./workspace` → `/workspace`) is shared with the agent. The rest of the host filesystem is not visible inside the container, which illustrates process and filesystem isolation (namespaces, bind mounts).

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Build the files-mcp server** (requires [Bun](https://bun.sh))

```bash
npm run build:mcp
```

> If Bun is not installed, the app will attempt to run files-mcp directly via `bun run src/index.ts` at startup.

**3. Configure environment**

```bash
cp .env.example .env
# Fill in your OPENROUTER_API_KEY in .env
```

**4. Configure workspace**

Edit `config.json` and set `fsRoot` to the directory the agent should have access to:

```json
{
  "fsRoot": "C:\\workspace"
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

## Run with Docker (sandbox demo)

**Prerequisites:** Docker with Compose support, `.env` with `OPENROUTER_API_KEY` (same as local setup).

The Compose file sets `FS_ROOT=/workspace` and mounts `./workspace` on the host to `/workspace` in the container. Put files you want the agent to see under `./workspace` on the host.

```bash
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY

docker compose build
docker compose run --rm app
```

Resource limits under `deploy.resources.limits` in [`docker-compose.yml`](./docker-compose.yml) are optional guardrails for the demo (applied by current Docker Compose on the local engine).

**Note:** The image runs as the non-root `node` user. If the mounted `workspace` directory is not writable by that user on your system, fix host permissions or adjust the setup.

## Usage

Type a message and press Enter. The agent will use filesystem tools automatically when needed.

| Command    | Description               |
|------------|---------------------------|
| `/history` | Show conversation history |
| `/clear`   | Clear the console         |
| `/exit`    | Quit                      |

**Example prompts:**

- `Save this conversation to chat.txt`
- `Read the file notes.md`
- `List all files in the workspace`
- `Search for files containing "TODO"`

## Configuration

Edit `config.json` to change model, tokens, temperature, or workspace path.

| Field         | Default                        | Description                          |
|---------------|--------------------------------|--------------------------------------|
| `model`       | `openai/gpt-4o`                | OpenRouter model ID                  |
| `maxTokens`   | `1024`                         | Max tokens per response              |
| `temperature` | `0.7`                          | Sampling temperature                 |
| `baseUrl`     | `https://openrouter.ai/api/v1` | API base URL                         |
| `fsRoot`      | `C:\\workspace`                | Workspace directory for file access  |

Environment variable **`FS_ROOT`**, when set, overrides `fsRoot` from `config.json` (used by Docker Compose so the container does not need a separate config file).

## Filesystem tools

The agent uses [files-mcp](./mcp/files-mcp/) — a sandboxed MCP server that restricts all file operations to the configured `fsRoot` directory.

| Tool        | Description                                          |
|-------------|------------------------------------------------------|
| `fs_read`   | Read files or list directories                       |
| `fs_write`  | Create or update files (line-based editing)          |
| `fs_search` | Find files by name or search content                 |
| `fs_manage` | Delete, rename, move, copy, mkdir                    |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log`. Each entry has a timestamp and level (`INFO`, `ERROR`, `USER`, `ASSISTANT`).
