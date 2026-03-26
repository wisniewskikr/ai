import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load local project .env (OPENROUTER_API_KEY, RESEND_API_KEY, RESEND_FROM)
const __dir = path.dirname(fileURLToPath(import.meta.url));
const localEnv = path.resolve(__dir, "../.env");
if (existsSync(localEnv) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(localEnv);
}

// Validate OpenRouter API key
if (!process.env.OPENROUTER_API_KEY) {
  console.error(`\x1b[31mError: OPENROUTER_API_KEY environment variable is not set\x1b[0m`);
  console.error("       Add it to the .env file: OPENROUTER_API_KEY=sk-or-...");
  process.exit(1);
}

// Validate Resend API key
if (!process.env.RESEND_API_KEY) {
  console.error(`\x1b[31mError: RESEND_API_KEY environment variable is not set\x1b[0m`);
  console.error("       Add it to the .env file: RESEND_API_KEY=re_...");
  process.exit(1);
}

if (!process.env.RESEND_FROM) {
  console.error(`\x1b[31mError: RESEND_FROM environment variable is not set\x1b[0m`);
  console.error("       Add it to the .env file: RESEND_FROM=noreply@yourdomain.com");
  process.exit(1);
}

export const AI_API_KEY = process.env.OPENROUTER_API_KEY;
export const RESPONSES_API_ENDPOINT = "https://openrouter.ai/api/v1/responses";
export const EXTRA_API_HEADERS = {
  "HTTP-Referer": "https://github.com/js-ai-openrouter-confirmation-newemail",
  "X-Title": "File & Email Agent",
};

export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM = process.env.RESEND_FROM;

export const api = {
  model: "openai/gpt-4.1",
  maxOutputTokens: 16384,
  instructions: `You are an assistant with access to file system tools and email sending.

## AVAILABLE TOOLS

### File Operations (MCP)
- fs_read: Read file contents
- fs_write: Write/create files
- fs_list: List directory contents
- fs_search: Search for files

### Email (Native)
- send_email: Send email to whitelisted recipients

## CRITICAL: EMAIL WORKFLOW

When the user asks to send an email:
1. Call send_email tool IMMEDIATELY with the email details
2. DO NOT ask for confirmation - the system handles that automatically
3. DO NOT preview the email in your response - the system shows a UI
4. Just call the tool and report the result

The system will intercept the tool call and show a confirmation UI to the user.
Your job is to call the tool, not to confirm.

## RULES

- Use tools to help the user with file-related tasks
- Always confirm before overwriting existing files
- Report results clearly after operations complete`
};