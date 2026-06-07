import { createInterface } from 'readline';
import { config } from '../config.js';

export function showMenu(): void {
  console.log('\n=== Ethical Scraper Demo ===\n');
  console.log('Choose an example:');
  console.log(`  [1] robots.txt BLOCKED   — ${config.exampleUrls.robotsBlocked}`);
  console.log(`  [2] robots.txt ALLOWED   — ${config.exampleUrls.robotsAllowed}`);
  console.log(`  [3] PII Detection        — ${config.exampleUrls.piiDetection}`);
  console.log(`  [4] Rate Limiting        — ${config.exampleUrls.rateLimiting.join(', ')}`);
  console.log('  [5] Enter your own URL');
  console.log('  [0] Exit');
  console.log('');
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export const promptChoice = () => ask('Your choice: ');
export const promptUrl = () => ask('Enter URL: ');
