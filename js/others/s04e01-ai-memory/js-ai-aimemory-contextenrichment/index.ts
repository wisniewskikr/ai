import "dotenv/config";
import { select, input } from "@inquirer/prompts";
import { compareContexts } from "./src/services/compare.js";
import { log } from "./src/utils/logger.js";

const PRESET_QUESTIONS = [
  "Which projects use the Payment API?",
  "Which components depend on Auth Service?",
  "What do I know about databases in our system?",
];

async function main(): Promise<void> {
  console.log("\n=== COMPANY KNOWLEDGE BASE — AI Memory Demo ===\n");

  while (true) {
    const choice = await select({
      message: "Select a question:",
      choices: [
        ...PRESET_QUESTIONS.map((q, i) => ({ name: `${i + 1}. ${q}`, value: q })),
        { name: "4. Ask your own question...", value: "custom" },
        { name: "5. Exit", value: "exit" },
      ],
    });

    if (choice === "exit") {
      console.log("\nGoodbye!");
      break;
    }

    const question =
      choice === "custom"
        ? await input({ message: "Your question:" })
        : choice;

    if (!question.trim()) continue;

    try {
      log("INFO", `Session started. Question: ${question}`);
      await compareContexts(question);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\nError: ${message}`);
      log("ERROR", message);
    }

    console.log();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
