# JS AI Single Call — No Tools

A minimal "Hello World" example of a single-call AI architecture in JavaScript. The model receives a prompt and returns the result. No tools or function-calling are used.

## Architecture

```
Prompt → Single LLM call → Result
```

The application:
1. Reads `config.json` for the prompt and model name
2. Sends one chat completion request to the model
3. Returns and logs the result

## Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your API key to `.env`:
   ```
   OPENROUTER_API_KEY=your-key-here
   ```

## Configuration

Edit `config.json` to change the prompt or model:

```json
{
  "prompt": "Convert the following text to uppercase: \"hello world\"",
  "model": "gpt-4o"
}
```

| Field   | Description                        |
|---------|------------------------------------|
| `prompt` | Prompt sent to the model          |
| `model` | Model ID used for the completion   |

## Usage

```bash
npm start
```

### Example output

```
[INFO] Starting single-call example
[INFO] Prompt        : "Convert the following text to uppercase: "hello world""
[INFO] Model         : gpt-4o
[INFO] Sending request to model...
[SUCCESS] Response received
[SUCCESS] Result        : "HELLO WORLD"
[INFO] Log saved to  : logs/run-2024-01-01T12-00-00-000Z.log
```

## Logs

Each run writes a timestamped log file to the `logs/` directory. The log format is:

```
[<ISO timestamp>] [<LEVEL>] <message>
```

## Project structure

```
.
├── index.js        # Main application
├── config.json     # Input text and model configuration
├── package.json    # Project metadata and dependencies
├── .env            # API keys (not committed)
└── logs/           # Per-run log files (not committed)
```
