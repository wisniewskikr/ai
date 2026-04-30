import "dotenv/config";
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";
import { ATTACK_VARIANTS } from "./prompts/attackVariants.js";
import { sendMessage } from "./services/chat.js";
import { analyzeResponse } from "./services/attackAnalyzer.js";
import { createLogger, Logger } from "./utils/logger.js";
import { printMenu, promptUser } from "./utils/menu.js";
import config from "../config.json";

function getApiKey(): string {
  const key = process.env["OPENROUTER_API_KEY"];
  if (!key) {
    console.error("ERROR: OPENROUTER_API_KEY not set in .env");
    process.exit(1);
  }
  return key;
}

async function selectAttackPrompt(): Promise<{ prompt: string; label: string } | null> {
  printMenu();
  const input = await promptUser("Your choice: ");
  const choice = parseInt(input, 10);

  if (choice === 0) return null;

  const customIndex = ATTACK_VARIANTS.length + 1;

  if (choice >= 1 && choice <= ATTACK_VARIANTS.length) {
    const variant = ATTACK_VARIANTS[choice - 1];
    return { prompt: variant.prompt, label: variant.label };
  }

  if (choice === customIndex) {
    const custom = await promptUser("Enter your role framing attack: ");
    if (!custom) {
      console.log("No input provided.");
      return null;
    }
    return { prompt: custom, label: "Custom Attack" };
  }

  console.log("Invalid choice.");
  return null;
}

function printAttackPrompt(label: string, attackPrompt: string): void {
  console.log(`\n--- Attack: ${label} ---`);
  console.log(`Prompt: "${attackPrompt}"`);
}

function printModelResponse(response: string): void {
  console.log("\n--- Model Response ---");
  console.log(response);
}

function printAnalysis(leaked: boolean, comment: string): void {
  console.log("\n--- Security Analysis ---");
  const status = leaked ? "[!] VULNERABILITY DETECTED" : "[*] Attack Resisted";
  console.log(status);
  console.log(comment);
  console.log("-------------------------\n");
}

async function runAttack(apiKey: string, logger: Logger): Promise<void> {
  const selected = await selectAttackPrompt();
  if (!selected) {
    console.log("Exiting.");
    return;
  }

  const { prompt: attackPrompt, label } = selected;

  printAttackPrompt(label, attackPrompt);
  logger.info(`Attack selected: ${label}`);
  logger.info(`Attack prompt: ${attackPrompt}`);

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: attackPrompt },
  ];

  const chatConfig = {
    apiKey,
    apiBaseUrl: config.apiBaseUrl,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };

  let response: string;
  try {
    response = await sendMessage(messages, chatConfig, logger);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\nRequest failed: ${msg}`);
    logger.error(`Request failed: ${msg}`);
    return;
  }

  printModelResponse(response);
  logger.info(`Model response: ${response}`);

  const analysis = analyzeResponse(response);
  printAnalysis(analysis.leaked, analysis.comment);
  logger.info(`Analysis — leaked: ${analysis.leaked}, terms: ${analysis.leakedTerms.join(", ") || "none"}`);
}

async function main(): Promise<void> {
  const apiKey = getApiKey();
  const logger = createLogger(config.logFile);

  logger.info("Application started");
  console.log("\nSystem Prompt Leakage Demo — Role Framing Attacks");
  console.log("Educational purposes only.\n");

  while (true) {
    await runAttack(apiKey, logger);

    const again = await promptUser("Run another attack? (y/n): ");
    if (again.toLowerCase() !== "y") break;
  }

  logger.info("Application exited");
  console.log("Goodbye.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
