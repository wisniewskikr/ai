import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface Config {
  scraperName: string;
  scraperEmail: string;
  rateLimitMs: number;
  requestTimeoutMs: number;
  model: string;
  exampleUrls: {
    robotsBlocked: string;
    robotsAllowed: string;
    piiDetection: string;
    rateLimiting: string[];
  };
  piiPatterns: Record<string, string>;
}

export const config: Config = JSON.parse(
  readFileSync(join(__dirname, '../config.json'), 'utf-8')
);
