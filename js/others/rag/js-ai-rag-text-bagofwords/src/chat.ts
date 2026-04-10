import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Config } from './config';
import { Message, sendMessage } from './api';
import { log } from './logger';
import { KnowledgeBase, findRelevantChunks } from './rag';

function printHistory(history: Message[]): void {
  if (history.length === 0) {
    console.log('(no messages yet)');
    return;
  }
  console.log('\n--- conversation history ---');
  for (const msg of history) {
    const label = msg.role.toUpperCase().padEnd(9);
    console.log(`${label} ${msg.content}`);
  }
  console.log('--- end of history ---\n');
}

function printHelp(): void {
  console.log('Available commands:');
  console.log('  /history  — show conversation history');
  console.log('  /clear    — clear the console');
  console.log('  /exit     — quit the chatbot');
  console.log();
}

export async function runChat(config: Config, kb: KnowledgeBase): Promise<void> {
  const rl = readline.createInterface({ input, output });
  const history: Message[] = [];

  log('INFO', 'Session started');
  printHelp();

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('You: ');
    } catch {
      // stdin closed (EOF or Ctrl+D)
      log('INFO', 'Session ended (stdin closed)');
      console.log('\nGoodbye!');
      rl.close();
      return;
    }

    const trimmed = userInput.trim();
    if (!trimmed) continue;

    if (trimmed === '/exit') {
      log('INFO', 'Session ended by user');
      console.log('Goodbye!');
      rl.close();
      return;
    }

    if (trimmed === '/history') {
      printHistory(history);
      continue;
    }

    if (trimmed === '/clear') {
      console.clear();
      printHelp();
      continue;
    }

    log('USER', trimmed);

    // RAG: find relevant knowledge and inject as context before sending to LLM
    const context = findRelevantChunks(trimmed, kb, config.topK);
    let userContent = trimmed;
    if (context.length > 0) {
      log('INFO', `RAG: injecting ${context.length} relevant chunk(s)`);
      userContent = `Relevant context:\n${context.join('\n')}\n\nQuestion: ${trimmed}`;
    } else {
      log('INFO', 'RAG: no relevant chunks found, sending question as-is');
    }

    history.push({ role: 'user', content: userContent });

    try {
      const reply = await sendMessage(history, config);
      history.push({ role: 'assistant', content: reply });
      log('ASSISTANT', reply);
      console.log(`\nAssistant: ${reply}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', message);
      console.error(`Error: ${message}`);
      // remove the failed user message so history stays consistent
      history.pop();
    }
  }
}
