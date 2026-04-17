import { loadConfig } from './config';
import { runChat } from './chat';
import { log } from './logger';

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Startup error: ${message}`);
    process.exit(1);
  }

  try {
    await runChat(config);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log('ERROR', `Unhandled error: ${message}`);
    process.exit(1);
  }
}

main();
