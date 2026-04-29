import * as dotenv from "dotenv";
import { SECRET_SYSTEM_PROMPT } from "./prompts/systemPrompt";
import { PREDEFINED_ATTACKS } from "./prompts/attackScenarios";
import { sendMessage } from "./services/chat";
import { analyzeResponse } from "./services/analyzer";
import { createLogger } from "./utils/logger";
import { printBanner, printSeparator, ask } from "./utils/menu";
import config from "../config.json";

dotenv.config();

const logger = createLogger(config.logFile);

async function resolveAttackPrompt(choice: string): Promise<string | null> {
  if (choice === "1") return PREDEFINED_ATTACKS[0].prompt;
  if (choice === "2") return PREDEFINED_ATTACKS[1].prompt;
  if (choice === "3") return await ask("Enter your attack prompt: ");
  return null;
}

async function runAttack(attackPrompt: string, apiKey: string): Promise<void> {
  console.log("\nSending attack to AI...\n");
  logger.info(`Attack prompt sent: ${attackPrompt}`);

  const response = await sendMessage(SECRET_SYSTEM_PROMPT, attackPrompt, apiKey);

  printSeparator();
  console.log("AI RESPONSE:");
  console.log("");
  console.log(response);
  printSeparator();

  const analysis = analyzeResponse(response);
  const status = analysis.leaked ? ">>> ATTACK SUCCEEDED — LEAKED <<<<" : ">>> ATTACK FAILED — SAFE <<<";

  console.log(status);
  console.log("");
  console.log(analysis.comment);
  printSeparator();

  logger.info(
    `Result: ${analysis.leaked ? "LEAKED" : "SAFE"} | Keywords found: ${
      analysis.foundKeywords.join(", ") || "none"
    }`
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    logger.error("OPENROUTER_API_KEY not set. Create a .env file with your key.");
    process.exit(1);
  }

  logger.info("Application started");

  while (true) {
    printBanner();
    const choice = await ask("Your choice [1/2/3/q]: ");

    if (choice === "q") {
      console.log("\nExiting. Remember: always protect your system prompts!\n");
      logger.info("Application exited by user");
      break;
    }

    if (!["1", "2", "3"].includes(choice)) {
      console.log("Invalid choice. Please enter 1, 2, 3, or q.\n");
      continue;
    }

    const attackPrompt = await resolveAttackPrompt(choice);
    if (!attackPrompt) {
      console.log("Empty prompt. Try again.\n");
      continue;
    }

    if (choice === "1" || choice === "2") {
      const idx = parseInt(choice) - 1;
      console.log(`\nTechnique: ${PREDEFINED_ATTACKS[idx].technique}`);
      console.log(`\nPrompt: "${attackPrompt}"\n`);
    }

    try {
      await runAttack(attackPrompt, apiKey);
    } catch (err) {
      logger.error(`API call failed: ${err}`);
      console.log("\nError calling the API. Check logs/app.log for details.\n");
    }

    const again = await ask("Try another attack? [y/n]: ");
    if (again.toLowerCase() !== "y") {
      console.log("\nExiting. Remember: always protect your system prompts!\n");
      logger.info("Application exited by user");
      break;
    }
  }
}

main().catch((err) => {
  logger.error(`Fatal error: ${err}`);
  process.exit(1);
});
