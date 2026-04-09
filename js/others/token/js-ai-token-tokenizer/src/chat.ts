import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Config } from './config';
import { Message, sendMessage } from './api';
import { estimateTokens } from './tokenizer';

export async function runChat(config: Config): Promise<void> {
  const rl = readline.createInterface({ input, output });
  let history: Message[] = [];

  function printHelp(): void {
    console.log('Available commands:');
    console.log('  /clear  — clear the console and reset conversation history');
    console.log('  /exit   — exit the application');
    console.log();
  }

  printHelp();

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('You: ');
    } catch {
      console.log('\nGoodbye!');
      rl.close();
      return;
    }

    const trimmed = userInput.trim();
    if (!trimmed) continue;

    if (trimmed === '/exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    if (trimmed === '/clear') {
      history = [];
      console.clear();
      printHelp();
      continue;
    }

    // Build the full context for estimation (history + new message)
    const pendingHistory: Message[] = [...history, { role: 'user', content: trimmed }];
    const estimatedTokens = estimateTokens(pendingHistory, config.model);

    console.log(`\nEstimated input tokens: ${estimatedTokens}`);
    let confirm: string;
    try {
      confirm = await rl.question('Continue? (y/n): ');
    } catch {
      console.log('\nGoodbye!');
      rl.close();
      return;
    }

    if (confirm.trim().toLowerCase() !== 'y') {
      console.log();
      continue;
    }

    history.push({ role: 'user', content: trimmed });

    try {
      const result = await sendMessage(history, config);
      history.push({ role: 'assistant', content: result.content });

      console.log(`\nAssistant: ${result.content}\n`);
      console.log(
        `Tokens — estimated input: ${estimatedTokens} | actual input: ${result.promptTokens} | output: ${result.completionTokens}\n`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}\n`);
      history.pop();
    }
  }
}
