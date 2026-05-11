import 'dotenv/config';
import readline from 'readline';
import chalk from 'chalk';
import { runAgent } from './services/agent.js';
import { showLogs } from './services/viewer.js';

const PRESET_QUESTIONS = [
  { label: 'Check user access to a report          (OK)',      question: 'Check if user:42 has access to /reports/q4.pdf' },
  { label: 'Get file metadata                      (OK)',      question: 'Get metadata for file /data/customers.csv' },
  { label: 'Check user access to a restricted file (DENIED)', question: 'Check if user:99 has access to /admin/secrets.db' },
  { label: 'Get metadata for a forbidden path      (ERROR)',   question: 'Get metadata for /system/root/.ssh/id_rsa' },
];

const mode = process.argv[2];

if (mode === 'viewer') {
  showLogs();
  process.exit(0);
}

// Agent mode — interactive menu
async function main(): Promise<void> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(chalk.red('Error: OPENROUTER_API_KEY is not set in .env'));
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt: string): Promise<string> =>
    new Promise((resolve, reject) => {
      rl.question(prompt, resolve);
      rl.once('close', () => reject(new Error('Input stream closed')));
    });

  console.log(chalk.bold('\n=== AI Access Log Viewer ==='));
  console.log(chalk.gray('Each agent action is logged to SQLite for audit.\n'));

  while (true) {
    console.log(chalk.bold('Choose an option:'));
    PRESET_QUESTIONS.forEach((q, i) => {
      console.log(`  [${i + 1}] ${q.label}`);
    });
    console.log('  [5] Enter your own question');
    console.log('  [6] Exit\n');

    const choice = (await ask('Option: ')).trim();

    if (choice === '6') {
      rl.close();
      console.log(chalk.bold('\n=== Session complete. Final audit log:'));
      showLogs(10);
      break;
    }

    let question: string;

    if (['1', '2', '3', '4'].includes(choice)) {
      question = PRESET_QUESTIONS[parseInt(choice) - 1].question;
    } else if (choice === '5') {
      question = (await ask('Your question: ')).trim();
      if (!question) continue;
    } else {
      console.log(chalk.red('Invalid option.\n'));
      continue;
    }

    try {
      await runAgent(question);
    } catch (err) {
      console.error(chalk.red('\n[Error]:'), err instanceof Error ? err.message : String(err));
    }

    console.log('');
  }
}

main().catch(err => {
  const msg = err instanceof Error ? err.message : String(err);
  if (!msg.includes('Input stream closed')) {
    console.error(chalk.red('Fatal error:'), msg);
    process.exit(1);
  }
});
