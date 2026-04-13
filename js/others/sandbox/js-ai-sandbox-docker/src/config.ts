import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
  fsRoot: string;
}

export function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as Config;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set. Copy .env.example to .env and fill it in.');
  }

  const fsRoot = process.env.FS_ROOT?.trim() || config.fsRoot;
  if (!fsRoot) {
    throw new Error('fsRoot is not set in config.json and FS_ROOT is not set.');
  }

  return { ...config, fsRoot };
}
