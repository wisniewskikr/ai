import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { loadConfig } from './services/config';
import { sendMessage, Message } from './services/api';
import { log } from './services/logger';
import { loadSkill } from './services/skillLoader';

const SYSTEM_PROMPT = 'You are a helpful assistant.';

type SkillMode = 'explain-simple' | 'explain-expert';

async function pickMode(rl: readline.Interface): Promise<SkillMode> {
  console.log('\nHow would you like the answer?');
  console.log('  1 — Simple (for everyone)');
  console.log('  2 — Technical (for experts)');

  while (true) {
    const choice = (await rl.question('Choose [1/2]: ')).trim();
    if (choice === '1') return 'explain-simple';
    if (choice === '2') return 'explain-expert';
    console.log('Please enter 1 or 2.');
  }
}

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Startup error: ${message}`);
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });

  log('INFO', 'Session started');
  console.log('Welcome to Explainer Agent!');
  console.log('Ask any question and choose how you want it explained.');
  console.log('Type /exit to quit.\n');

  while (true) {
    let question: string;
    try {
      question = await rl.question('Your question: ');
    } catch {
      log('INFO', 'Session ended (stdin closed)');
      console.log('\nGoodbye!');
      rl.close();
      return;
    }

    const trimmed = question.trim();
    if (!trimmed) continue;

    if (trimmed === '/exit') {
      log('INFO', 'Session ended by user');
      console.log('Goodbye!');
      rl.close();
      return;
    }

    let mode: SkillMode;
    try {
      mode = await pickMode(rl);
    } catch {
      log('INFO', 'Session ended (stdin closed)');
      console.log('\nGoodbye!');
      rl.close();
      return;
    }

    let skill: string;
    try {
      skill = loadSkill(`${mode}.md`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', `Failed to load skill ${mode}: ${message}`);
      console.error(`Error loading skill: ${message}`);
      continue;
    }

    log('INFO', `Question [${mode}]: ${trimmed}`);

    const messages: Message[] = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${skill}` },
      { role: 'user', content: trimmed },
    ];

    try {
      const reply = await sendMessage(messages, config);
      log('INFO', `Answer: ${reply}`);
      console.log(`\nAnswer:\n${reply}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', message);
      console.error(`Error: ${message}`);
    }
  }
}

main();
