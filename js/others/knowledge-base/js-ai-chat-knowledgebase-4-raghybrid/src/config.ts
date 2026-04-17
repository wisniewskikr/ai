import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl: string;
  knowledgeBasePath: string;
  // RAG
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
}

export function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as Config;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. Copy .env.example to .env and fill it in.');
  }

  return config;
}
