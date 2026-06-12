import * as fs from 'fs';
import * as path from 'path';
import { MemoryManager } from '../memory/MemoryManager';
import { Message } from '../memory/shortTerm';
import config from '../../config.json';

export interface PromptContext {
  system: string;
  messages: Message[];
}

function loadPromptFile(filename: string): string {
  const promptPath = path.join(__dirname, filename);
  return fs.readFileSync(promptPath, 'utf-8').trim();
}

export function buildContext(memory: MemoryManager, promptFile: string): PromptContext {
  const basePrompt = loadPromptFile(promptFile);

  const longTermData = memory.longTerm.getAll();
  const recentActions = memory.episodic.getRecent(config.maxEpisodicSummaryEntries);
  const messages = memory.shortTerm.getMessages();

  const knownFacts = Object.entries(longTermData)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') || '(none)';

  const recentActionsText = recentActions
    .map(e => `${e.timestamp} | ${e.action} | ${e.result}`)
    .join('\n') || '(none)';

  const system = `${basePrompt}

[KNOWN FACTS ABOUT USER]
${knownFacts}

[RECENT AGENT ACTIONS]
${recentActionsText}`;

  return { system, messages };
}
