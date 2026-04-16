import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
}

export function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as Config;

  return config;
}
