import { loadConfig } from './config';
import { runChat } from './chat';
import { log } from './logger';
import { buildEmbeddings, loadKnowledge } from './rag';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function pickMode(): Promise<'build' | 'chat'> {
  const rl = readline.createInterface({ input, output });
  console.log('Select mode:');
  console.log('  1. Build embeddings  (reads knowledge.txt, saves embeddings.json)');
  console.log('  2. Run chat          (loads embeddings.json, starts conversation)');
  const answer = (await rl.question('Enter 1 or 2: ')).trim();
  rl.close();
  return answer === '1' ? 'build' : 'chat';
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

  const arg = process.argv[2];
  const mode: 'build' | 'chat' =
    arg === 'build' ? 'build' :
    arg === 'chat'  ? 'chat'  :
    await pickMode();

  if (mode === 'build') {
    try {
      await buildEmbeddings(config.knowledgeFile, config.embeddingsFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log('ERROR', `Build failed: ${message}`);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
    return;
  }

  const kb = loadKnowledge(config.embeddingsFile);

  try {
    await runChat(config, kb);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log('ERROR', `Unhandled error: ${message}`);
    process.exit(1);
  }
}

main();
