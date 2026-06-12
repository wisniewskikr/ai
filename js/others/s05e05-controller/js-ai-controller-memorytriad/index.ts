import 'dotenv/config';
import { select } from '@inquirer/prompts';
import { getDatabase } from './src/services/database';
import { MemoryManager } from './src/memory/MemoryManager';
import { logger } from './src/cli/logger';
import {
  handleIntroduce,
  handleRememberName,
  handleSummarizeSession,
  handleShowActionLog,
  handleAskQuestion,
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
        { value: 'introduce', name: '1. Introduce me       — agent tells who you are (long-term)' },
        { value: 'remember',  name: '2. Remember my name   — saves your name to the database (long-term)' },
        { value: 'summarize', name: '3. Summarize session  — summary of this conversation (short-term)' },
        { value: 'log',       name: '4. Show action log    — what the agent did before (episodic)' },
        { value: 'ask',       name: '5. Ask your question  — custom question with full memory context' },
        { value: 'clear',     name: '6. Clear my data      — remove all long-term and episodic memory' },
        { value: 'exit',      name: '7. Exit' },
      ],
    });

    switch (action) {
      case 'introduce':  await handleIntroduce(memory);        break;
      case 'remember':   await handleRememberName(memory);     break;
      case 'summarize':  await handleSummarizeSession(memory); break;
      case 'log':        await handleShowActionLog(memory);    break;
      case 'ask':        await handleAskQuestion(memory);      break;
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
