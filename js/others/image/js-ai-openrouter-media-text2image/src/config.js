export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() ?? "";
export const AI_API_KEY = OPENROUTER_API_KEY;
export const RESPONSES_API_ENDPOINT = "https://openrouter.ai/api/v1/responses";
export const EXTRA_API_HEADERS = {};
export const OPENROUTER_EXTRA_HEADERS = {};
export const resolveModelForProvider = (model) => model;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() ?? "";
const hasGeminiImageBackend = Boolean(GEMINI_API_KEY);
const hasOpenRouterImageBackend = Boolean(OPENROUTER_API_KEY);

if (!hasGeminiImageBackend && !hasOpenRouterImageBackend) {
  console.error("\x1b[31mError: image generation backend is not configured\x1b[0m");
  console.error("       Add one of these to the repo root .env file:");
  console.error("       OPENROUTER_API_KEY=sk-or-v1-...   # uses google/gemini-3.1-flash-image-preview");
  console.error("       GEMINI_API_KEY=...                # uses native Gemini image generation");
  process.exit(1);
}

export { GEMINI_API_KEY };
export const IMAGE_BACKEND = hasOpenRouterImageBackend ? "openrouter" : "gemini";

export const api = {
  model: resolveModelForProvider("gpt-5.2"),
  visionModel: resolveModelForProvider("gpt-5.2"),
  maxOutputTokens: 16384,
  instructions: `You are an image generation agent using JSON-based prompting.

## WORKFLOW

1. **READ template**: Read workspace/template.json
2. **COPY template**: Copy workspace/template.json → workspace/prompts/{output_filename}_{timestamp}.json
3. **EDIT subject**: Use MCP file tools to edit ONLY the "subject" section in the copied file to match the user's request
4. **READ prompt file**: Read the complete JSON from the copied file
5. **GENERATE**: Call create_image with a prompt built from the JSON content
6. **REPORT**: Return the generated image path and prompt file path

## PROCESS STEPS

1. Read workspace/template.json to get the current subject and settings

2. Copy template.json to workspace/prompts/ using output.filename + timestamp:
   Example: if output.filename is "hello_world" → workspace/prompts/hello_world_1769959315686.json

3. Edit the copied file - ONLY modify the "subject" object to match the user's request.
   Leave all other sections (style, technical, output) unchanged.

4. Read the complete JSON from the copied prompt file

5. Call create_image:
   - prompt: compose a detailed description from the JSON (subject, style, colors, mood)
   - output_name: use output.filename from the JSON (e.g. "hello_world")
   - aspect_ratio: use technical.aspect_ratio from the JSON (e.g., "16:9")
   - image_size: use technical.resolution from the JSON (e.g., "2k")
   - reference_images: [] (empty unless editing an existing image)

## RULES
- **NEVER edit template.json directly** — always copy first
- **ONLY edit the "subject" section** in the copied file
- **USE output.filename** from the JSON as the output_name for create_image
- **USE technical settings** from the JSON for aspect_ratio and image_size`
};

export const gemini = {
  apiKey: GEMINI_API_KEY,
  imageBackend: IMAGE_BACKEND,
  imageModel: IMAGE_BACKEND === "openrouter"
    ? "google/gemini-3.1-flash-image-preview"
    : "gemini-3-pro-image-preview",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/interactions",
  openRouterEndpoint: "https://openrouter.ai/api/v1/chat/completions"
};

export const outputFolder = "workspace/output";
