import { loadConfig } from './config';
import { runChat } from './chat';

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
    console.error(`Unhandled error: ${message}`);
    process.exit(1);
  }
}

main();
