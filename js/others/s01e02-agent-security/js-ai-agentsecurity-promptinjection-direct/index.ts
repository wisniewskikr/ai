import * as readline from "readline";
import { startChat, Mode } from "./src/services/chat";
import { Colors } from "./src/utils/display";
import { logger } from "./src/utils/logger";

function showWelcome(): void {
  console.log(`
${Colors.bold}+----------------------------------------------+
|   SafeBank AI  —  Prompt Injection Demo      |
+----------------------------------------------+${Colors.reset}

This demo shows how ${Colors.red}${Colors.bold}direct prompt injection${Colors.reset} works
against an AI-powered banking chatbot.

${Colors.bold}Select operating mode:${Colors.reset}

  ${Colors.red}${Colors.bold}[1] VULNERABLE${Colors.reset}
      No protection. Attack queries are sent directly to the model.
      The bot may reveal confidential employee data, passwords,
      and internal system codes.

  ${Colors.green}${Colors.bold}[2] PROTECTED${Colors.reset}
      Regex-based attack detection. Suspicious messages are blocked
      before reaching the model.
      Note: regex can be bypassed with obfuscation (demo limitation).

`);
}

showWelcome();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Select mode (1 = vulnerable, 2 = protected): ", (answer) => {
  rl.close();

  const mode: Mode = answer.trim() === "2" ? "protected" : "vulnerable";
  const color = mode === "vulnerable" ? Colors.red : Colors.green;

  logger.info(`Session started in ${mode} mode`);
  console.log(`\nStarting in ${color}${Colors.bold}${mode.toUpperCase()}${Colors.reset} mode...\n`);

  startChat(mode);
});
