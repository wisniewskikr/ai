# js-ai-openrouter-media-image2text

AI-powered image description tool. Select an image and get a detailed description from the AI.

## Run

```bash
npm start
```

## Required setup

1. Copy `.env.example` to `.env`.
2. Set `OPENROUTER_API_KEY`.
3. Put images in `images/`.

## What it does

1. Lists all images found in `images/`
2. Prompts you to pick one by number or filename
3. Sends the image to the AI vision model (`openai/gpt-4o`)
4. Prints a detailed description to the console
