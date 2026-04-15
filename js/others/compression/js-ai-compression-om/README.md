# ObservationalMemory Demo

A TypeScript/Node.js CLI app that demonstrates **Observational Memory (OM)** compression — a technique for keeping LLM context lean without losing critical information.

## What it does

The app streams a 15-line biography into a chat conversation line by line, triggering two compression cycles:

1. **Observer** fires every 5 messages — copies recent biography lines directly into an observations list (deterministic, no API call).
2. **Reflector** fires 3 messages after the Observer — calls the LLM to compress all active observations into a single dense prose paragraph, then **wipes the entire message history** and replaces it with that paragraph.

The final summary prompt asks specific fact-by-fact questions, proving that key details survived compression.

## Compression flow

```
msg  1–5   → load lines, no compression yet
msg  5     → Observer #1 fires  → active observations: 5
msg  6–8   → load more lines
msg  8     → Reflector #1 fires → history wiped → generation: 1
msg  9–13  → load more lines (fresh context, compact memory)
msg 13     → Observer #2 fires  → active observations: 5
msg 14–15  → load last lines
msg 16     → final summary — what survived compression?
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your OpenRouter API key
echo "OPENROUTER_API_KEY=sk-or-..." > .env

# 3. Run
npm start
```

## Configuration

Edit `config.json` to change the model, trigger thresholds, temperature, etc.

| Key | Default | Description |
|-----|---------|-------------|
| `model` | `google/gemini-2.0-flash-001` | OpenRouter model ID |
| `observerTriggerAfterMessages` | `5` | How many messages before Observer fires |
| `reflectorTriggerAfterMessages` | `3` | How many messages after Observer before Reflector fires |
| `maxTokensPerRequest` | `1024` | Max tokens per API response |
| `temperature` | `0.4` | LLM temperature |

## Key concept

ObservationalMemory is a memory-management strategy for LLM chat sessions:

- **Observer** — watches incoming messages and writes structured observations
- **Reflector** — reads observations and distils them into a compact memory
- **Sealed** — observations already processed by the Reflector (immutable)
- **Active** — observations not yet reflected (still accumulating)

After the Reflector runs, the `messages[]` array contains exactly **one entry**: the compressed system message. Old messages are gone. Context shrinks, facts survive.
