import * as readline from "readline";
import { SYSTEM_PROMPT } from "../prompts/system-prompt";
import { QUERIES, ATTACKS, SHORTCUT_DESCRIPTIONS } from "../prompts/predefined";
import { sendChat, Message } from "./openrouter";
import { validateInput, detectPrivateDataLeak } from "./validator";
import {
  printBot,
  printUser,
  printAlert,
  printBlocked,
  printInfo,
  printMode,
  Colors,
} from "../utils/display";
import { logger } from "../utils/logger";

export type Mode = "vulnerable" | "protected";

// Conversation history sent to the model on every request
const messages: Message[] = [{ role: "system", content: SYSTEM_PROMPT }];

let currentMode: Mode;

function showHelp(): void {
  console.log(`${Colors.bold}Shortcuts:${Colors.reset}`);
  for (const [key, desc] of Object.entries(SHORTCUT_DESCRIPTIONS)) {
    console.log(`  ${key.padEnd(4)}  ${desc}`);
  }
  console.log(`
${Colors.bold}Commands:${Colors.reset}
  /switch   Toggle between vulnerable / protected mode
  /help     Show this help
  /exit     Quit the application
`);
}

// Expand shorthand like q1, a2 to their full message text
function resolveInput(input: string): string {
  return QUERIES[input] ?? ATTACKS[input] ?? input;
}

async function processMessage(userInput: string): Promise<void> {
  const message = resolveInput(userInput);

  if (message !== userInput) {
    printInfo(`Expanded: "${message}"`);
  }

  printUser(message);
  logger.info(`[${currentMode}] User: ${message}`);

  if (currentMode === "protected") {
    const result = validateInput(message);
    if (result.blocked) {
      printBlocked(result.reason ?? "unknown pattern");
      logger.warn(`[protected] Blocked: ${message} | ${result.reason}`);
      return;
    }
  }

  try {
    messages.push({ role: "user", content: message });
    const reply = await sendChat(messages);
    messages.push({ role: "assistant", content: reply });

    printBot(reply);
    logger.info(`[${currentMode}] Bot: ${reply}`);

    if (detectPrivateDataLeak(reply)) {
      printAlert("The bot response contains PRIVATE DATA from the system prompt!");
      logger.warn(`[${currentMode}] PRIVATE DATA LEAK detected in response`);
    }
  } catch (error) {
    // On failure, remove the user message we already pushed
    messages.pop();
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`${Colors.red}Error: ${msg}${Colors.reset}`);
    logger.error(`Request failed: ${msg}`);
  }
}

export function startChat(mode: Mode): void {
  currentMode = mode;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  showHelp();
  printMode(currentMode);

  const prompt = (): void => {
    rl.question(`${Colors.dim}>${Colors.reset} `, async (raw) => {
      const input = raw.trim();

      if (!input) {
        prompt();
        return;
      }

      if (input === "/exit" || input === "/quit") {
        console.log("Goodbye!");
        logger.info("Session ended by user");
        rl.close();
        return;
      }

      if (input === "/switch") {
        currentMode = currentMode === "vulnerable" ? "protected" : "vulnerable";
        printMode(currentMode);
        logger.info(`Mode switched to ${currentMode}`);
        prompt();
        return;
      }

      if (input === "/help") {
        showHelp();
        prompt();
        return;
      }

      await processMessage(input);
      console.log();
      prompt();
    });
  };

  prompt();
}
