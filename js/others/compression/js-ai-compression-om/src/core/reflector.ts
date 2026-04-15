import * as fs from 'fs';
import * as path from 'path';
import { MemoryState, sealAndCompress } from './memory';
import { ChatSession, Message } from './chat';
import { logger } from '../utils/logger';

function loadPrompt(name: string): string {
  const promptPath = path.resolve(process.cwd(), 'src', 'prompts', name);
  return fs.readFileSync(promptPath, 'utf-8').trim();
}

export interface ReflectorResult {
  beforeMessages: number;
  beforeTokens: number;
  afterTokens: number;
}

export async function runReflector(
  memory: MemoryState,
  chat: ChatSession
): Promise<ReflectorResult> {
  const reflectorPrompt = loadPrompt('reflector.txt');
  const beforeMessages = chat.getMessageCount();
  const beforeTokens = chat.estimateTokens();

  const observationList = memory.active.join('\n');
  const request = `${reflectorPrompt}\n\nObservations to compress:\n${observationList}`;

  // Call the LLM outside of main history — the Reflector works on observations only,
  // not on the accumulated chat messages. Those will be wiped entirely afterward.
  const messages: Message[] = [{ role: 'user', content: request }];

  logger.info(`Reflector: compressing ${memory.active.length} observations (${beforeMessages} msgs, ~${beforeTokens} tokens before)`);

  const { reply: prose } = await chat.callApiDirect(messages);

  logger.info(`Reflector: compressed prose:\n${prose}`);

  // Seal observations and store the compressed prose in OM state
  sealAndCompress(memory, prose);

  // The entire message history is replaced by one system message containing the prose.
  // This is the compression: context shrinks, key facts survive.
  chat.replaceWithCompressed(prose);

  const afterTokens = Math.ceil(prose.length / 4);

  logger.info(`Reflector done. After: 1 msg ~${afterTokens} tokens. Generation: ${memory.generation}`);

  return { beforeMessages, beforeTokens, afterTokens };
}
