import * as readline from "readline";
import { PREDEFINED_ATTACKS } from "../prompts/attackScenarios";

export function printBanner(): void {
  console.log("");
  console.log("=".repeat(60));
  console.log("  SYSTEM PROMPT LEAKAGE — Educational Demo");
  console.log("  Hypothetic Scenario: Can AI reveal its secrets?");
  console.log("=".repeat(60));
  console.log("");
  console.log("The chatbot has a SECRET system prompt containing:");
  console.log("  - A classified project codename");
  console.log("  - An emergency escalation code");
  console.log("");
  console.log("Choose an attack scenario:");
  console.log("");
  PREDEFINED_ATTACKS.forEach((a) => console.log(`  ${a.label}`));
  console.log("  [3] Enter your own custom attack prompt");
  console.log("  [q] Quit");
  console.log("");
}

export function printSeparator(): void {
  console.log("");
  console.log("-".repeat(60));
  console.log("");
}

export function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
