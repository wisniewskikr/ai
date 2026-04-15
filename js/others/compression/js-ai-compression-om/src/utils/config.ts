import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  model: string;
  openRouterBaseUrl: string;
  dataFile: string;
  observerTriggerAfterMessages: number;
  reflectorTriggerAfterMessages: number;
  logDir: string;
  maxTokensPerRequest: number;
  temperature: number;
  streaming: boolean;
}

export function loadConfig(): Config {
  const configPath = path.resolve(process.cwd(), 'config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const p = JSON.parse(raw);

  if (typeof p.model !== 'string') throw new Error('config.json: model must be a string');
  if (typeof p.openRouterBaseUrl !== 'string') throw new Error('config.json: openRouterBaseUrl must be a string');
  if (typeof p.dataFile !== 'string') throw new Error('config.json: dataFile must be a string');
  if (typeof p.observerTriggerAfterMessages !== 'number') throw new Error('config.json: observerTriggerAfterMessages must be a number');
  if (typeof p.reflectorTriggerAfterMessages !== 'number') throw new Error('config.json: reflectorTriggerAfterMessages must be a number');
  if (typeof p.logDir !== 'string') throw new Error('config.json: logDir must be a string');
  if (typeof p.maxTokensPerRequest !== 'number') throw new Error('config.json: maxTokensPerRequest must be a number');
  if (typeof p.temperature !== 'number') throw new Error('config.json: temperature must be a number');
  if (typeof p.streaming !== 'boolean') throw new Error('config.json: streaming must be a boolean');

  return p as Config;
}
