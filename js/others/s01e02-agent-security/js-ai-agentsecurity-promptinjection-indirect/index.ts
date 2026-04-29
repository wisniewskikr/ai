import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { startChat, Mode } from './src/services/chat';
import { logger } from './src/utils/logger';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('Error: OPENROUTER_API_KEY is not set in .env');
  process.exit(1);
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function selectMode(): Promise<Mode> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n======================================');
  console.log('   Indirect Prompt Injection Demo');
  console.log('   SafeBank AI Assistant');
  console.log('======================================\n');
  console.log('Select mode:\n');
  console.log('  [1] VULNERABLE  — No protection, injection attacks succeed');
  console.log('  [2] PROTECTED   — Regex scanner blocks known attack patterns\n');

  while (true) {
    const choice = (await prompt(rl, 'Enter 1 or 2: ')).trim();
    if (choice === '1') {
      rl.close();
      return 'vulnerable';
    }
    if (choice === '2') {
      rl.close();
      return 'protected';
    }
    console.log('Invalid choice, please enter 1 or 2.');
  }
}

async function main(): Promise<void> {
  try {
    const mode = await selectMode();
    logger.info(`Application started — mode: ${mode}`);
    await startChat(mode, apiKey as string);
  } catch (err) {
    console.error('Fatal error:', (err as Error).message);
    logger.error(`Fatal: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
