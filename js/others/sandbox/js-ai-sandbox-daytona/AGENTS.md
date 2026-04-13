# AGENTS.md

## Project Overview

This repository contains JavaScript/TypeScript examples demonstrating AI concepts: agents, multi-agent systems, workflows, observability, RAG, structured outputs, and more. Examples are organized under `js/architectures/` and `js/others/`.

All examples use **Node.js** and communicate with AI models via **OpenRouter** or direct provider APIs.

---

## Daytona Sandbox

### What is it?

Daytona provides isolated, programmable computers (sandboxes) for AI agents. Instead of running AI-generated or agent-driven code on your local machine, you spin up a sandbox via SDK, execute code inside it, and tear it down — all programmatically.

Each sandbox is an isolated Linux environment with its own namespaces (process, network, filesystem, IPC), dedicated vCPU/RAM/disk, and a REST API surface.

### Architecture

```
Your code / AI agent
        │
        │  SDK / REST API
        ▼
Daytona Control Plane
(NestJS API, Proxy, Sandbox Manager, Snapshot Builder)
        │
        ▼
Compute Plane — Runners
(Linux sandbox with daemon exposing Toolbox API)
        ├── Filesystem operations
        ├── Git clone / commit / push
        ├── Process execution
        └── Terminal sessions
```

### Do I need to upload my project?

No. You interact with the sandbox programmatically after creation:

- **Git clone** — pull a repo directly inside the sandbox
- **SDK file upload** — copy individual files via `sandbox.filesystem.uploadFile()`
- **Docker snapshot** — start from a pre-built OCI image

### Default resources per sandbox

| Resource | Default | Max (per org) |
|---|---|---|
| vCPU | 1 | 4 |
| RAM | 1 GB | 8 GB |
| Disk | 3 GB | 10 GB |

### Billing

Pay-as-you-go based on CPU/RAM/disk consumption. Charges appear with up to 48 h delay. Always call `sandbox.delete()` when done to stop billing.

### SDKs

Available for: **TypeScript**, Python, Ruby, Go.

Install TypeScript SDK:
```bash
npm install @daytona/sdk
```

### Required environment variable

```
DAYTONA_API_KEY=your_key_here
```

Get your API key at: **https://app.daytona.io**

---

## Hello World Demo — Daytona + TypeScript

### What it does

1. Creates a Daytona sandbox
2. Uploads a small TypeScript script to the sandbox
3. Installs `tsx` inside the sandbox
4. Runs the script — the sandbox prints `Hello from Daytona sandbox!`
5. Returns the output to the local process
6. Deletes the sandbox

### Planned location

```
js/others/daytona-hello-world/
├── index.ts          Entry point — creates sandbox, uploads script, runs it, deletes sandbox
├── hello.ts          Script that runs inside the sandbox (prints Hello World)
├── package.json
└── .env              DAYTONA_API_KEY=...
```

### Sketch of index.ts

```typescript
import { Daytona } from "@daytona/sdk";

const daytona = new Daytona();

const sandbox = await daytona.create();

// Upload the script that will run inside the sandbox
await sandbox.filesystem.uploadFile("./hello.ts", "/home/user/hello.ts");

// Install tsx and run the script
const result = await sandbox.process.exec(
  "npm install -g tsx && tsx /home/user/hello.ts"
);

console.log(result.output); // Hello from Daytona sandbox!

await sandbox.delete();
```

### Sketch of hello.ts (runs inside the sandbox)

```typescript
const message: string = "Hello from Daytona sandbox!";
console.log(message);
```

---

## Sandbox Use Cases in This Project

| Use case | Description |
|---|---|
| **Safe code execution** | Run AI-generated code without touching the local machine |
| **Agent tool** | Give an AI agent a full computer as a tool — it can install packages, run servers, write and test code |
| **Isolated evaluation** | Run eval scripts in parallel sandboxes without conflicts |
| **CI-like workflows** | Clone a repo, install deps, run tests, return results — all via SDK |
