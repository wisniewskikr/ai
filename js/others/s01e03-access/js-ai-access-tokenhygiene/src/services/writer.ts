import { TokenVault } from "./token-vault.js";
import { complete } from "../utils/openrouter.js";
import { writerPrompt } from "../prompts/writer.js";
import { config } from "../utils/config.js";

const { tokenName, model } = config.services.writer;

export class Writer {
  constructor(private vault: TokenVault) {}

  async write(topic: string): Promise<string> {
    const apiKey = await this.vault.getApiKey(tokenName, model);
    const { text, tokens } = await complete(apiKey, model, writerPrompt(topic));
    this.vault.recordUsage(tokenName, model, tokens);
    return text;
  }
}
