import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { runAgent } from './agent';
import { logAudit } from './audit';

dotenv.config();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question: string): Promise<string> =>
  new Promise(resolve => rl.question(question, resolve));

const SCENARIOS = {
  '1': 'Add a new product: Laptop Pro, price 2999 PLN, category Electronics',
  '2': 'List all products in the catalog',
  '3': 'Change the price of Laptop to 1999 PLN',
  '4': 'Remove the product: Laptop',
} as const;

function printMenu(): void {
  console.log('\n=== Read-Only Agent Demo ===\n');
  console.log('1. Create — Add a new product       [blocked — no write access]');
  console.log('2. Read   — List / search products  [allowed]');
  console.log('3. Update — Change product price    [blocked — no write access]');
  console.log('4. Delete — Remove a product        [blocked — no write access]');
  console.log('5. Custom — Type your own task');
  console.log('6. Exit');
  console.log('');
}

async function main(): Promise<void> {
  logAudit('INFO', 'Application started');

  while (true) {
    printMenu();
    const choice = (await ask('Choose an option (1-6): ')).trim();

    if (choice === '6') {
      logAudit('INFO', 'Application exited by user');
      console.log('Goodbye!');
      rl.close();
      break;
    }

    let task: string;

    if (choice in SCENARIOS) {
      task = SCENARIOS[choice as keyof typeof SCENARIOS];
      console.log(`\nTask: "${task}"`);
    } else if (choice === '5') {
      task = (await ask('Enter your task: ')).trim();
      if (!task) continue;
    } else {
      console.log('Invalid option. Please choose 1-6.');
      continue;
    }

    console.log('\nAgent is processing...\n');

    try {
      const result = await runAgent(task);
      console.log('--- Agent Response ---');
      console.log(result);
      console.log('----------------------');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logAudit('ERROR', `Agent error: ${message}`);
      console.error(`Error: ${message}`);
    }
  }
}

main();
