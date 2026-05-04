import { TokenVault } from "./token-vault.js";
import { complete } from "../utils/openrouter.js";
import { analyzerPrompt } from "../prompts/analyzer.js";
import { config } from "../utils/config.js";

const { tokenName, model } = config.services.analyzer;

export class Analyzer {
  constructor(private vault: TokenVault) {}

  async analyze(text: string): Promise<string> {
    const apiKey = await this.vault.getApiKey(tokenName, model);
    const { text: result, tokens } = await complete(apiKey, model, analyzerPrompt(text));
    this.vault.recordUsage(tokenName, model, tokens);
    return result;
  }

  getTokenName(): string { return tokenName; }
  getModel(): string { return model; }
}
