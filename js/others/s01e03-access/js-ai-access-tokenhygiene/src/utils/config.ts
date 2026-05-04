import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const raw = readFileSync(join(root, "config.json"), "utf-8");

interface ServiceConfig {
  tokenName: string;
  apiKeyEnvVar: string;
  model: string;
  ttlMinutes: number;
}

interface Config {
  services: {
    chat: ServiceConfig;
    analyzer: ServiceConfig;
    writer: ServiceConfig;
  };
  proxy: {
    baseUrl: string;
    maxTokens: number;
  };
  logging: {
    dir: string;
    file: string;
  };
}

export const config: Config = JSON.parse(raw);
