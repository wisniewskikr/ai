# js-ai-sandbox-docker

AI agent with filesystem tools (OpenRouter), **intended to run only inside the Docker sandbox** via Docker Compose. The app and [files-mcp](./mcp/files-mcp/) run in a container; only `./workspace` on the host is mounted at `/workspace` inside the container.

## Sandbox: two layers

1. **Docker** — Process runs in a container. The host directory `./workspace` is bind-mounted to `/workspace`. The rest of the host filesystem is not visible inside the container.
2. **MCP (files-mcp)** — All file tools are restricted to the workspace root (`fsRoot` / `FS_ROOT`). Paths outside that root are rejected by the server.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose
- OpenRouter API key

## Run (Docker Compose)

**1. Environment**

```bash
cp .env.example .env
# Set OPENROUTER_API_KEY in .env
```

**2. Build and start the chat**

```bash
docker compose build
docker compose run --rm app
```

Put any files the agent should read or edit under [`workspace/`](./workspace/) on the host; they appear as `/workspace` in the container. Compose sets `FS_ROOT=/workspace`, which overrides `fsRoot` in `config.json` for a consistent sandbox path.

Resource limits under `deploy.resources.limits` in [`docker-compose.yml`](./docker-compose.yml) are optional guardrails (applied by current Docker Compose on the local engine).

**Note:** The image runs as the non-root `node` user. If the mounted `workspace` directory is not writable by that user on your system, adjust host permissions or the Compose user mapping.

## Usage

Type a message and press Enter. The agent will use filesystem tools when needed.

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

Model and API settings live in [`config.json`](./config.json). The workspace directory for file tools defaults to `/workspace` (aligned with the container). Environment variable **`FS_ROOT`** overrides `fsRoot` when set (Compose sets it for you).

| Field         | Default                        | Description                          |
|---------------|--------------------------------|--------------------------------------|
| `model`       | `openai/gpt-4o`                | OpenRouter model ID                  |
| `maxTokens`   | `1024`                         | Max tokens per response              |
| `temperature` | `0.7`                          | Sampling temperature                 |
| `baseUrl`     | `https://openrouter.ai/api/v1` | API base URL                         |
| `fsRoot`      | `/workspace`                   | Workspace root (overridden by `FS_ROOT` in Compose) |

## Filesystem tools

The agent uses [files-mcp](./mcp/files-mcp/) — tools are scoped to the configured workspace root only.

| Tool        | Description                                          |
|-------------|------------------------------------------------------|
| `fs_read`   | Read files or list directories                       |
| `fs_write`  | Create or update files (line-based editing)          |
| `fs_search` | Find files by name or search content                 |
| `fs_manage` | Delete, rename, move, copy, mkdir                    |

## Logs

Session logs are written to `logs/YYYY-MM-DD.log` **inside the container** (under the app working directory). They are not persisted on the host unless you add a volume for `logs/` in Compose.

## Developing the application

The [Dockerfile](./Dockerfile) runs `npm ci`, builds `files-mcp`, and compiles the TypeScript app. To change code, edit the repository and run `docker compose build` again. Local `npm install` / `npm run dev` is optional and only for contributors who want a non-container toolchain; **running the agent as an end user is via Compose only.**
