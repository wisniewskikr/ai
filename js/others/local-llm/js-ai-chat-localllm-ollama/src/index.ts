import "dotenv/config";
import * as readline from "readline";
import configJson from "../config.json" assert { type: "json" };
import { chat, clearHistory } from "./services/chat.js";
import { logger } from "./utils/logger.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`Chatbot ready. Model: ${configJson.ollama.model}`);
console.log("Commands: /exit — quit, /clear — new conversation\n");
logger.info(`Session started. Model: ${configJson.ollama.model}`);

function prompt(): void {
  rl.question("You: ", async (input) => {
    const text = input.trim();

    if (!text) return prompt();

    if (text === "/exit") {
      logger.info("Session ended by user");
      rl.close();
      return;
    }

    if (text === "/clear") {
      clearHistory();
      console.log("History cleared.\n");
      return prompt();
    }

    try {
      await chat(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}\n`);
      logger.error(`Chat error: ${message}`);
    }

    prompt();
  });
}

prompt();
