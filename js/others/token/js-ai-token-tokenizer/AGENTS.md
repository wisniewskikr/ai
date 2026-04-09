# AI Chat Token Tokenizer — Application Specification

## Description

A console-based AI chat application with token count preview before sending a message and after receiving a response.

## Configuration

- Model and API parameters defined in `config.json` (model, maxTokens, temperature, baseUrl)
- API key loaded from the `OPENROUTER_API_KEY` environment variable in `.env`

## Features

### Startup screen and after `/clear`
On launch and after clearing the console, available commands are displayed:
```
Available commands:
  /clear  — clear the console and reset conversation history
  /exit   — exit the application
```

### Conversation flow

1. User types a message
2. Application calculates the **estimated input token count** (full context: history + new message) using `tiktoken`
3. Application displays that count and asks: **"Continue? (y/n)"**
4. If the user confirms (`y`), the message is sent to the API
5. The **AI response** is displayed
6. Below the response, a token summary is shown:
   ```
   Tokens — estimated input: X | actual input: Y | output: Z
   ```

### Special commands

| Command  | Action |
|----------|--------|
| `/clear` | Clears the console, resets conversation history, redisplays the command list |
| `/exit`  | Exits the application |

## Technical requirements

- Node.js
- `tiktoken` library for local token estimation **before** sending (based on full history + new message)
- API calls via OpenRouter (baseUrl from `config.json`)
- Conversation history kept in memory (array of `messages`)
- Actual token counts read from API response (`usage.prompt_tokens`, `usage.completion_tokens`)
