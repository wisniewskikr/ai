import { loadConfig } from './config';
import { runChat } from './chat';
import { log } from './logger';
import { loadKnowledge } from './rag';

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Startup error: ${message}`);
    process.exit(1);
  }

  const kb = await loadKnowledge(config.knowledgeFile);

  try {
    await runChat(config, kb);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log('ERROR', `Unhandled error: ${message}`);
    process.exit(1);
  }
}

main();
