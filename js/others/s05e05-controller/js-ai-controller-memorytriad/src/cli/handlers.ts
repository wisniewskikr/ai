import { input } from '@inquirer/prompts';
import { MemoryManager } from '../memory/MemoryManager';
import { buildContext } from '../prompts/context-builder';
import { callModel } from '../services/openrouter';
import { logger } from './logger';

async function ask(memory: MemoryManager, promptFile: string, userMessage: string): Promise<string> {
  const { system, messages } = buildContext(memory, promptFile);
  return callModel(system, [...messages, { role: 'user', content: userMessage }]);
}

export async function handleIntroduce(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Introduce me');
  const userMessage = 'Who am I? Tell me about myself based on what you know.';
  memory.shortTerm.add('user', userMessage);

  try {
    const response = await ask(memory, 'introduce.md', userMessage);
    memory.shortTerm.add('assistant', response);
    memory.episodic.log('Introduce me', response.substring(0, 120));
    logger.info('Agent response saved to episodic memory');
    console.log('\n' + response + '\n');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to call model: ${msg}`);
    console.error(`\nError: ${msg}\n`);
  }
}

export async function handleRememberName(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Remember my name');
  const name = await input({ message: 'What is your name?' });

  if (!name.trim()) {
    logger.warn('User provided empty name — skipped');
    console.log('\nNo name provided.\n');
    return;
  }

  memory.longTerm.set('name', name.trim());
  logger.info(`Saved name to long-term memory: ${name.trim()}`);
  memory.episodic.log('Remember my name', `Saved name: ${name.trim()}`);
  console.log(`\nGot it! I'll remember your name is ${name.trim()}.\n`);
}

export async function handleSummarizeSession(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Summarize session');

  if (memory.shortTerm.isEmpty()) {
    logger.warn('Summarize requested but session is empty');
    console.log('\nNo conversation history yet in this session.\n');
    return;
  }

  try {
    const { system, messages } = buildContext(memory, 'summarize.md');
    const response = await callModel(system, messages);
    memory.episodic.log('Summarize session', response.substring(0, 120));
    logger.info('Session summary generated');
    console.log('\n' + response + '\n');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to summarize session: ${msg}`);
    console.error(`\nError: ${msg}\n`);
  }
}

export async function handleShowActionLog(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Show action log');
  const entries = memory.episodic.getAll();

  if (entries.length === 0) {
    console.log('\nNo actions logged yet.\n');
    return;
  }

  console.log('\n--- Action Log ---');
  for (const entry of entries) {
    console.log(`[${entry.timestamp}] ${entry.action} → ${entry.result}`);
  }
  console.log('------------------\n');
}

export async function handleAskQuestion(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Ask your question');
  const question = await input({ message: 'Your question:' });

  if (!question.trim()) {
    logger.warn('User submitted empty question');
    console.log('\nNo question provided.\n');
    return;
  }

  memory.shortTerm.add('user', question.trim());

  try {
    const response = await ask(memory, 'system.md', question.trim());
    memory.shortTerm.add('assistant', response);
    memory.episodic.log('Ask question', response.substring(0, 120));
    logger.info('Agent response saved to episodic memory');
    console.log('\n' + response + '\n');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to call model: ${msg}`);
    console.error(`\nError: ${msg}\n`);
  }
}

export async function handleClearData(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Clear my data');
  memory.longTerm.clear();
  memory.episodic.clear();
  memory.shortTerm.clear();
  logger.info('All memory cleared');
  console.log('\nAll your data has been removed. I no longer know who you are.\n');
}
