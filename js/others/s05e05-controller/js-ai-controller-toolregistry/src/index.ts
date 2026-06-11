import readline from "readline";
import * as dotenv from "dotenv";
import { runAgent } from "./services/agent";
import { logger } from "./utils/logger";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const PRESET_QUESTIONS: Record<number, string> = {
  1: "What is the weather like in Warsaw today?",
  2: "Przetłumacz na angielski: 'Dzisiaj jest piękna pogoda i chciałbym pójść na długi spacer.'",
  3: "Calculate: 15% of 480 + sqrt(144)",
  4: "Summarize this text: 'Artificial intelligence is transforming industries across the globe. From healthcare to finance, AI systems are being deployed to automate tasks, improve decision-making, and create new products and services. While these advances bring significant benefits, they also raise important questions about employment, privacy, and the ethical use of technology. Experts disagree on how quickly these changes will unfold, but most agree that adaptation will be essential for both businesses and individuals.'",
};

function showMenu(): void {
  console.log("\n=== Tool Registry Demo ===\n");
  console.log("Pick an option:");
  console.log("  1. Check weather for a city");
  console.log("  2. Translate text to English");
  console.log("  3. Solve a math problem");
  console.log("  4. Summarize a text");
  console.log("  5. Type your own question");
  console.log("  0. Exit\n");
}

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function handleOption(option: string): Promise<boolean> {
  if (option === "0") {
    console.log("\nGoodbye!");
    return false;
  }

  const num = parseInt(option, 10);
  if (isNaN(num) || num < 1 || num > 5) {
    console.log("Invalid option. Please enter 0-5.");
    return true;
  }

  let question: string;
  if (num >= 1 && num <= 4) {
    question = PRESET_QUESTIONS[num];
    console.log(`\nQuestion: ${question}`);
  } else {
    question = await ask("Your question: ");
    if (!question.trim()) {
      console.log("Question cannot be empty.");
      return true;
    }
  }

  logger.info(`User selected option: ${num}`);
  console.log("\nProcessing...\n");

  try {
    const answer = await runAgent(question);
    console.log(`\nAnswer: ${answer}\n`);
    logger.info("Agent completed successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nError: ${message}\n`);
    logger.error(`Agent failed: ${message}`);
  }

  return true;
}

async function main(): Promise<void> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("Error: OPENROUTER_API_KEY is not set in .env");
    process.exit(1);
  }

  let running = true;
  while (running) {
    showMenu();
    try {
      const option = await ask("Choice: ");
      running = await handleOption(option.trim());
    } catch {
      // stdin closed (EOF) — exit gracefully
      break;
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
