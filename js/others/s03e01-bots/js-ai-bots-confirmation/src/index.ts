import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

import { ask, close } from './utils/readline';
import { logger } from './utils/logger';
import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { buildEmailPrompt } from './prompts/email.prompt';
import { generateEmail } from './services/openrouter.service';
import { saveEmail } from './services/email.service';

interface Config {
  model: string;
  signature: string;
  aiFooter: string;
  emailsDir: string;
}

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Config;
}

function formatEmail(content: string, signature: string, aiFooter: string): string {
  return `${content}\n\n${signature}\n\n${aiFooter}`;
}

function isExit(input: string): boolean {
  return input.toLowerCase() === '/exit';
}

async function collectEmailData(
): Promise<{ topic: string; recipient: string; concept: string } | null> {
  console.log('\n--- New Email ---');

  const topic = await ask('Topic    : ');
  if (isExit(topic)) return null;

  const recipient = await ask('Recipient: ');
  if (isExit(recipient)) return null;

  const concept = await ask('Concept  : ');
  if (isExit(concept)) return null;

  return { topic, recipient, concept };
}

async function generateAndReview(
  topic: string,
  recipient: string,
  concept: string,
  config: Config
): Promise<void> {
  while (true) {
    console.log('\nGenerating email...');
    logger.info(`Generating email — topic: "${topic}", recipient: "${recipient}"`);

    let emailContent: string;
    try {
      const prompt = buildEmailPrompt(topic, recipient, concept);
      emailContent = await generateEmail(SYSTEM_PROMPT, prompt, config.model);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\nAPI error: ${msg}`);
      logger.error(`API call failed: ${msg}`);
      return;
    }

    const fullEmail = formatEmail(emailContent, config.signature, config.aiFooter);

    console.log('\n========== Generated Email ==========\n');
    console.log(fullEmail);
    console.log('\n=====================================\n');

    const choice = await ask('[A]pprove / [R]ecreate / [C]ancel: ');

    if (isExit(choice) || choice.toLowerCase() === 'c') {
      logger.info('Email cancelled by user');
      console.log('Email discarded.');
      return;
    }

    if (choice.toLowerCase() === 'a') {
      const filepath = saveEmail(topic, fullEmail, config.emailsDir);
      console.log(`\nEmail saved: ${filepath}`);
      logger.info(`Email approved and saved: ${filepath}`);
      return;
    }

    if (choice.toLowerCase() === 'r') {
      logger.info('User requested email regeneration');
      continue;
    }

    console.log('Unknown choice. Please enter A, R, or C.');
  }
}

async function main(): Promise<void> {
  console.log('=== Email Bot — Human Confirmation Required ===');
  console.log('Type /exit at any prompt to quit.\n');

  const config = loadConfig();
  logger.info('Email bot started');

  while (true) {
    const data = await collectEmailData();

    if (!data) {
      console.log('\nGoodbye!');
      logger.info('Email bot exited via /exit');
      break;
    }

    await generateAndReview(data.topic, data.recipient, data.concept, config);

    const again = await ask('\nNew email? [Y/N]: ');
    if (isExit(again) || again.toLowerCase() !== 'y') {
      console.log('\nGoodbye!');
      logger.info('Email bot session ended');
      break;
    }
  }

  close();
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  logger.error(`Fatal error: ${msg}`);
  console.error('Fatal error:', msg);
  process.exit(1);
});
