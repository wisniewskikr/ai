# js-ai-openrouter-media-text2image

Image generation agent using JSON-based prompt templates.

## Run

```bash
npm start
# or
npm run dev
```

## Required setup

1. Copy `.env.example` to `.env` in this project folder.
2. Set at least one image generation key:
   - `OPENROUTER_API_KEY` — uses `google/gemini-3.1-flash-image-preview` via OpenRouter
   - `GEMINI_API_KEY` — uses native Gemini image generation

If both keys are present, OpenRouter takes priority.

## What it does

1. Reads `workspace/template.json` for subject, style, and technical settings
2. Copies the template to `workspace/prompts/` (named after `output.filename` + timestamp)
3. Edits only the `subject` section in the copied file to match the user's request
4. Generates an image and saves it to `workspace/output/`

## Customizing the template

Edit `workspace/template.json` to change the default subject, style, colors, resolution, and output filename:

```json
{
  "output": {
    "filename": "hello_world"
  },
  "subject": { ... },
  "style": { ... },
  "technical": {
    "resolution": "2k",
    "aspect_ratio": "16:9"
  }
}
```

The `output.filename` value is used as the base name for the generated image (e.g. `hello_world_1749959315686.png`).

## Usage

After running `npm start`, an interactive prompt appears where you type requests in plain English and the agent generates images accordingly:

```
You: Generate a Hello World image
You: Make the letters bigger
You: clear
You: exit
```

Special commands:
- `clear` — resets the conversation history (agent forgets previous messages)
- `exit` — stops the program
