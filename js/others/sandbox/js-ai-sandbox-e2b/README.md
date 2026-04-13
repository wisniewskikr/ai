# E2B Hello World

A minimal demo that creates an [E2B](https://e2b.dev) sandbox, runs a TypeScript script inside it, captures the output, and tears everything down — programmatically, from Node.js.

---

## What it does

1. Creates an isolated Linux sandbox via the E2B SDK
2. Uploads `hello.ts` into the sandbox
3. Installs `tsx` inside the sandbox and runs the script
4. Prints the script output locally
5. Kills the sandbox

The sandbox never modifies your local machine beyond network calls.

---

## Project structure

```
.
├── index.ts      Entry point — orchestrates the full lifecycle
├── hello.ts      Script that runs inside the sandbox
├── logger.ts     Console + file logger (no external deps)
├── config.json   Non-secret configuration (committed)
├── package.json
├── tsconfig.json
├── .env          API keys only (not committed)
└── logs/         One log file per day, created at runtime
```

---

## Configuration

The project splits config into two files by sensitivity:

### `config.json` — non-secret settings, safe to commit

```json
{
  "sandbox": {
    "scriptName": "hello.ts"
  }
}
```

| Key | Description |
|---|---|
| `sandbox.scriptName` | Name of the script uploaded and run inside the sandbox |

### `.env` — secrets only, never committed

```env
E2B_API_KEY=your_key_here
```

Get your API key at [e2b.dev](https://e2b.dev).

---

## Prerequisites

- Node.js >= 20
- An E2B account

---

## Setup

```bash
npm install
```

Create a `.env` file in the project root with your API key (see above).
`config.json` is already present in the repository with sensible defaults.

---

## Run

```bash
npm start
```

Expected output:

```
[2026-04-13T10:45:36.922Z] [INFO ] === E2B Hello World ===
[2026-04-13T10:45:36.924Z] [INFO ] Creating sandbox...
[2026-04-13T10:45:37.686Z] [INFO ] Sandbox ready  id=io2qurq4f5fuxo29pawsb
[2026-04-13T10:45:37.687Z] [INFO ] Uploading  local=.../hello.ts  remote=/home/user/hello.ts
[2026-04-13T10:45:38.030Z] [INFO ] Upload complete
[2026-04-13T10:45:38.031Z] [INFO ] Installing tsx...
[2026-04-13T10:45:41.835Z] [INFO ] tsx installed
[2026-04-13T10:45:41.836Z] [INFO ] Running: tsx /home/user/hello.ts
[2026-04-13T10:45:42.418Z] [INFO ] Script output: Hello from E2B sandbox!

  => Hello from E2B sandbox!

[2026-04-13T10:45:42.419Z] [INFO ] Killing sandbox  id=io2qurq4f5fuxo29pawsb
[2026-04-13T10:45:43.303Z] [INFO ] Sandbox killed. All done.
```

Logs are also written to `logs/YYYY-MM-DD.log` in plain text, without ANSI color codes.

---

## Billing note

E2B charges while a sandbox is alive. The code always kills the sandbox in a `finally` block, so a crash during execution will still clean up.

---

## Extending this

| What you want | Where to change it |
|---|---|
| Different script to run | Change `sandbox.scriptName` in `config.json` |
| Sandbox with more RAM/CPU | Pass `resources` to `Sandbox.create()` in `index.ts` |
| Pre-baked image (e.g. with tsx) | Pass `template` to `Sandbox.create()` in `index.ts` |
| Parallel sandboxes | Call `Sandbox.create()` multiple times with `Promise.all()` |
