# Daytona Hello World

A minimal demo that creates a [Daytona](https://daytona.io) sandbox, runs a TypeScript script inside it, captures the output, and tears everything down — programmatically, from Node.js.

---

## What it does

1. Creates an isolated Linux sandbox via the Daytona SDK
2. Uploads `hello.ts` into the sandbox
3. Installs `tsx` inside the sandbox and runs the script
4. Prints the script output locally
5. Deletes the sandbox

The sandbox never modifies your local machine beyond network calls.

---

## Project structure

```
.
├── index.ts      Entry point — orchestrates the full lifecycle
├── hello.ts      Script that runs inside the sandbox
├── logger.ts     Console + file logger (no external deps)
├── package.json
├── tsconfig.json
├── .env          API keys (not committed)
└── logs/         One log file per day, created at runtime
```

---

## Prerequisites

- Node.js >= 20
- A Daytona account — get your API key at [app.daytona.io](https://app.daytona.io)

---

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
DAYTONA_API_KEY=your_key_here
DAYTONA_BASE_URL=https://app.daytona.io/api
```

---

## Run

```bash
npm start
```

Expected output:

```
[2024-01-15T10:23:01.123Z] [INFO ] === Daytona Hello World ===
[2024-01-15T10:23:01.456Z] [INFO ] Creating sandbox...
[2024-01-15T10:23:08.789Z] [INFO ] Sandbox ready  id=abc123
[2024-01-15T10:23:08.900Z] [INFO ] Uploading  local=.../hello.ts  remote=/home/user/hello.ts
[2024-01-15T10:23:09.100Z] [INFO ] Upload complete
[2024-01-15T10:23:09.200Z] [INFO ] Installing tsx...
[2024-01-15T10:23:25.000Z] [INFO ] tsx installed
[2024-01-15T10:23:25.100Z] [INFO ] Running script: tsx /home/user/hello.ts
[2024-01-15T10:23:26.200Z] [INFO ] Script output: Hello from Daytona sandbox!

  => Hello from Daytona sandbox!

[2024-01-15T10:23:26.300Z] [INFO ] Deleting sandbox  id=abc123
[2024-01-15T10:23:28.000Z] [INFO ] Sandbox deleted. All done.
```

Logs are also written to `logs/YYYY-MM-DD.log` in plain text.

---

## Billing note

Daytona charges while a sandbox is alive. The code always deletes the sandbox in a `finally` block, so a crash during execution will still clean up.

---

## Extending this

| What you want | Where to change it |
|---|---|
| Different script to run | Replace `hello.ts` |
| Sandbox with more RAM/CPU | Pass `resources` to `daytona.create()` |
| Pre-baked image with tsx | Pass `snapshot` to `daytona.create()` |
| Parallel sandboxes | Call `daytona.create()` multiple times with `Promise.all()` |
