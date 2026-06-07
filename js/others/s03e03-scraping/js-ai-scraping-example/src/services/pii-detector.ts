import { config } from '../config.js';

export interface PiiMatch {
  type: string;
  value: string;
}

export function detectPii(content: string): PiiMatch[] {
  const matches: PiiMatch[] = [];

  for (const [type, pattern] of Object.entries(config.piiPatterns)) {
    const regex = new RegExp(pattern, 'gi');
    const found = content.match(regex);
    if (found) {
      matches.push(...found.map(value => ({ type, value })));
    }
  }

  return matches;
}
