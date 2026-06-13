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

export async function handleAddInfo(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Add some information about you');
  const key = await input({ message: 'What kind of information? (e.g. name, hobby, preference):' });

  if (!key.trim()) {
    logger.warn('User provided empty key — skipped');
    console.log('\nNo information type provided.\n');
    return;
  }

  const value = await input({ message: `Value for "${key.trim()}":` });

  if (!value.trim()) {
    logger.warn('User provided empty value — skipped');
    console.log('\nNo value provided.\n');
    return;
  }

  memory.longTerm.set(key.trim(), value.trim());
  memory.shortTerm.add('user', `Save this about me: ${key.trim()} = ${value.trim()}`);
  memory.shortTerm.add('assistant', `Got it! I'll remember: ${key.trim()} = ${value.trim()}.`);
  logger.info(`Saved to long-term memory: ${key.trim()}=${value.trim()}`);
  memory.episodic.log('Add information', `Saved ${key.trim()}=${value.trim()}`);
  console.log(`\nGot it! I'll remember: ${key.trim()} = ${value.trim()}.\n`);
}

export async function handleSummarizeSession(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Summarize session');

  try {
    const { system, messages } = buildContext(memory, 'summarize.md');
    const trigger = { role: 'user' as const, content: 'Please summarize the current session.' };
    const response = await callModel(system, [...messages, trigger]);
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

export async function handleClearSession(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Clear session');
  memory.shortTerm.clear();
  logger.info('Short-term memory cleared');
  console.log('\nSession cleared. I no longer remember this conversation, but your saved data is intact.\n');
}

export async function handleClearData(memory: MemoryManager): Promise<void> {
  logger.info('User selected: Clear my data');
  memory.longTerm.clear();
  memory.episodic.clear();
  memory.shortTerm.clear();
  logger.info('All memory cleared');
  console.log('\nAll your data has been removed. I no longer know who you are.\n');
}
