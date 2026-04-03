# js-ai-multiagent-tool-mcp

A minimal multi-agent JavaScript example that transforms `"hello world"` to
`"HELLO WORLD"` using two independent subagents:

- **subagent-no-tool** — asks the LLM directly; no external calls.
- **subagent-mcp-tool** — gives the LLM a `to_uppercase` tool served by a local
  [MCP](https://modelcontextprotocol.io/) server; the LLM calls the tool.

Both subagents produce the same result so you can verify that the MCP wiring
works correctly by comparing the two outputs.

---

## Architecture

```
main.js
  └── orchestrator          (LLM-powered: plans the delegation)
        ├── subagent-no-tool    (LLM only — no tools)
        └── subagent-mcp-tool   (LLM + MCP tool)
                └── MCP server  (stdio, spawned automatically)
                      └── tool: to_uppercase(text) → TEXT
```

Agent-to-agent communication is **explicit function calls in code**, not runtime
tool dispatch. The execution path is always visible in logs and trivial to trace.

---

## Requirements

- Node.js ≥ 18 (native `fetch` required)
- An [OpenRouter](https://openrouter.ai/) API key

---

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY=<your key>
```

Optionally edit `config.json` to change the model, token limit, or input text.

---

## Running

```bash
npm start
```

Every run creates a timestamped log file under `logs/`. Console output is
colour-coded; the log file contains plain text for easy grepping.

### Expected output

```
[...] [INFO ] ========================================
[...] [INFO ]    Multi-Agent Hello World (MCP tools)
[...] [INFO ] ========================================
[...] [INFO ] Config loaded — model: openai/gpt-4o | input: "hello world"
[...] [INFO ] [Orchestrator] Starting
[...] [INFO ] [Orchestrator] Plan: ...
[...] [INFO ] [SubagentNoTool] Output: "HELLO WORLD"
[...] [INFO ] [SubagentMcp] Calling MCP tool: to_uppercase({"text":"hello world"})
[...] [INFO ] [SubagentMcp] MCP tool returned: "HELLO WORLD"
[...] [INFO ] [SubagentMcp] Output: "HELLO WORLD"
[...] [INFO ]   Result (no tool):  HELLO WORLD
[...] [INFO ]   Result (MCP tool): HELLO WORLD
```

---

## Project structure

```
.
├── .env.example
├── config.json              # model, maxTokens, temperature, baseUrl, input
├── main.js                  # entry point
├── package.json
└── src/
    ├── agents/
    │   ├── orchestrator.js      # plans and delegates
    │   ├── subagent-no-tool.js  # LLM-only transformation
    │   └── subagent-mcp-tool.js # LLM + MCP tool transformation
    ├── lib/
    │   ├── api.js               # OpenRouter HTTP wrapper (plain + tool-use)
    │   ├── config.js            # loads config.json + .env, fails fast
    │   ├── logger.js            # console + timestamped file logger
    │   └── mcp-client.js        # spawns MCP server, returns connected client
    ├── mcp/
    │   └── server.js            # MCP stdio server — exposes to_uppercase tool
    └── prompts/
        ├── orchestrator.txt
        ├── subagent-no-tool.txt
        └── subagent-mcp-tool.txt
```

---

## Extending the project

**Add a new MCP tool:** edit `src/mcp/server.js` — add an entry to the
`ListToolsRequestSchema` handler and a branch in `CallToolRequestSchema`.

**Add a new subagent:** create `src/agents/subagent-<name>.js`, add a prompt
file, import it in `orchestrator.js`, and update `src/prompts/orchestrator.txt`
so the LLM knows about it.

**Change the model or input:** edit `config.json` — no code changes needed.

---

## Design notes

- Dependencies are intentionally minimal: `dotenv` + `@modelcontextprotocol/sdk`.
- The MCP server is spawned in-process via stdio; no daemon, no port to manage.
- Prompts live in plain text files — behaviour changes require no code edits.
- `chatCompletionWithTools` drives the tool-use loop generically; the subagent
  just feeds tool results back until `finish_reason !== "tool_calls"`.
