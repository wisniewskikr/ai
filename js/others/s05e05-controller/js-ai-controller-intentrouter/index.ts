import * as readline from "readline";
import { classifyIntent, Intent } from "./src/services/router";
import { query as similarityQuery } from "./src/services/similarityEngine";
import { query as graphQuery } from "./src/services/graphEngine";
import { query as graphragQuery } from "./src/services/graphragEngine";
import { logger } from "./src/utils/logger";

interface MenuItem {
  question: string;
  expectedIntent: Intent;
}

const MENU_ITEMS: MenuItem[] = [
  { question: "Who is most similar to Anna?", expectedIntent: "similarity" },
  { question: "Find someone with leadership skills", expectedIntent: "similarity" },
  { question: "Who reports to Jan?", expectedIntent: "relation" },
  { question: "What is the path between Piotr and Ewa?", expectedIntent: "relation" },
  { question: "Describe the overall company structure", expectedIntent: "global" },
  { question: "What are the main departments and their responsibilities?", expectedIntent: "global" },
];

function routeToEngine(intent: Intent, question: string): { engine: string; result: string } {
  switch (intent) {
    case "similarity":
      return { engine: "similarity engine", result: similarityQuery(question) };
    case "relation":
      return { engine: "graph engine", result: graphQuery(question) };
    case "global":
      return { engine: "GraphRAG engine", result: graphragQuery(question) };
  }
}

function printMenu(): void {
  console.log("\n=== Intent Router Demo ===\n");
  console.log("Select an option:");
  MENU_ITEMS.forEach((item, i) => {
    const tag = `[${item.expectedIntent.charAt(0).toUpperCase() + item.expectedIntent.slice(1).padEnd(9)}]`;
    console.log(`  ${i + 1}. ${tag}  ${item.question}`);
  });
  console.log("  7. [Custom]      Type your own question");
  console.log("  0. Exit");
  console.log("");
}

async function handlePredefined(item: MenuItem): Promise<void> {
  console.log(`\n> Question:         "${item.question}"`);
  console.log(`> Expected intent:  ${item.expectedIntent}`);
  console.log("  Classifying...");

  const detected = await classifyIntent(item.question);
  const verdict = detected === item.expectedIntent ? "CORRECT" : `WRONG (expected: ${item.expectedIntent})`;

  console.log(`> Detected intent:  ${detected}`);
  console.log(`> Verdict:          ${verdict}`);

  const { engine, result } = routeToEngine(detected, item.question);
  console.log(`\n> Result (${engine}):\n${result}`);

  logger.info(`Selected question: "${item.question}"`);
  logger.info(
    `Detected intent: ${detected} (expected: ${item.expectedIntent}) — ${detected === item.expectedIntent ? "CORRECT" : "WRONG"}`
  );
  logger.info(`${engine} result: ${result.replace(/\n/g, " | ")}`);
}

async function handleCustom(rl: readline.Interface): Promise<void> {
  const question = await new Promise<string>((resolve) => {
    rl.question("\n> Enter your question: ", resolve);
  });

  if (!question.trim()) {
    console.log("No question entered.");
    return;
  }

  console.log("  Classifying...");
  const detected = await classifyIntent(question);
  console.log(`\n> Detected intent:  ${detected}`);

  const { engine, result } = routeToEngine(detected, question);
  console.log(`\n> Result (${engine}):\n${result}`);

  logger.info(`Custom question: "${question}"`);
  logger.info(`Detected intent: ${detected}`);
  logger.info(`${engine} result: ${result.replace(/\n/g, " | ")}`);
}

async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () =>
    new Promise<string>((resolve) => {
      printMenu();
      rl.question("Your choice: ", resolve);
    });

  while (true) {
    const choice = (await ask()).trim();

    if (choice === "0") {
      console.log("\nGoodbye!");
      rl.close();
      break;
    }

    const index = parseInt(choice, 10) - 1;

    if (choice === "7") {
      await handleCustom(rl);
    } else if (index >= 0 && index < MENU_ITEMS.length) {
      await handlePredefined(MENU_ITEMS[index]);
    } else {
      console.log("Invalid choice. Please enter 0–7.");
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  logger.error(`Fatal error: ${String(err)}`);
  process.exit(1);
});
