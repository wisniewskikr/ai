# js-ai-openrouter-structured

## Description

A minimal Node.js application demonstrating how to use **structured output** with an AI model via the [OpenRouter](https://openrouter.ai) API. The model is instructed to return a JSON response conforming to a predefined schema (a person object), and the parsed fields are printed to the console.

**File structure:**

| File | Purpose |
|------|---------|
| `ai.js` | Handles all communication with the OpenRouter API; defines the person schema |
| `main.js` | Entry point — reads config and displays the structured AI response |
| `config.json` | Stores the model name and input message |
| `.key` | Stores your OpenRouter API key (never commit this file) |

## Person schema

The model is instructed to extract person data matching this structure:

```json
{
  "name": "string or null",
  "age": "number or null",
  "occupation": "string or null",
  "skills": ["array", "of", "strings"]
}
```

## Usage

**1. Install Node.js**

Requires Node.js v18 or higher (built-in `fetch` support).

**2. Add your API key**

Replace the placeholder in `.key` with your actual OpenRouter API key:

```
sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

**3. Configure the message and model**

Edit `config.json` to set your desired model and input message:

```json
{
    "model": "gpt-4o",
    "message": "John is 30 years old and works as a software engineer. He is skilled in JavaScript, Python, and React."
}
```

**4. Run the application**

```bash
node main.js
```

The extracted person fields will be printed to the console:

```
Name: John
Age: 30
Occupation: software engineer
Skills: JavaScript, Python, React
```
