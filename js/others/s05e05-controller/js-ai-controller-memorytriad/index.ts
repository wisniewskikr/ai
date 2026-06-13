import 'dotenv/config';
import { select } from '@inquirer/prompts';
import { getDatabase } from './src/services/database';
import { MemoryManager } from './src/memory/MemoryManager';
import { logger } from './src/cli/logger';
import {
  handleAddInfo,
  handleSummarizeSession,
  handleIntroduce,
  handleShowActionLog,
  handleClearSession,
  handleClearData,
} from './src/cli/handlers';

async function main(): Promise<void> {
  const db = getDatabase();
  const memory = new MemoryManager(db);

  logger.info('Application started');
  console.log('\nMemory Triad Demo — CLI Assistant\n');

  while (true) {
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { value: 'addinfo',   name: '1. Add some information about you — saves any fact to long-term memory' },
        { value: 'summarize', name: '2. Summarize session              — summary of this conversation (short-term)' },
        { value: 'introduce', name: '3. Introduce me                   — agent tells who you are (long-term)' },
        { value: 'log',       name: '4. Show action log                — what the agent did before (episodic)' },
        { value: 'clearsess', name: '5. Clear session                  — clears short-term memory (current conversation only)' },
        { value: 'clear',     name: '6. Clear my data                  — remove all long-term and episodic memory' },
        { value: 'exit',      name: '7. Exit' },
      ],
    });

    switch (action) {
      case 'addinfo':    await handleAddInfo(memory);          break;
      case 'summarize':  await handleSummarizeSession(memory); break;
      case 'introduce':  await handleIntroduce(memory);        break;
      case 'log':        await handleShowActionLog(memory);    break;
      case 'clearsess':  await handleClearSession(memory);     break;
      case 'clear':      await handleClearData(memory);        break;
      case 'exit':
        logger.info('Application exited by user');
        console.log('\nGoodbye!\n');
        process.exit(0);
    }
  }
}

main().catch(err => {
  const msg = err instanceof Error ? err.message : String(err);
  logger.error(`Unhandled error: ${msg}`);
  console.error('\nFatal error:', msg);
  process.exit(1);
});
