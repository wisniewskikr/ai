import readline from "readline";
import { ATTACK_VARIANTS } from "../prompts/attackVariants.js";

export function printMenu(): void {
  console.log("\n========================================");
  console.log(" SYSTEM PROMPT LEAKAGE — Role Framing Demo");
  console.log("========================================");
  console.log("Choose an attack variant:\n");

  ATTACK_VARIANTS.forEach((variant, i) => {
    console.log(`  [${i + 1}] ${variant.label}`);
  });

  console.log(`  [${ATTACK_VARIANTS.length + 1}] Enter custom role framing attack`);
  console.log("  [0] Exit");
  console.log("");
}

export async function promptUser(question: string): Promise<string> {
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
