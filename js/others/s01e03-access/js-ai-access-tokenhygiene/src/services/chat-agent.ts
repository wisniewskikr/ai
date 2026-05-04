import { TokenVault } from "./token-vault.js";
import { complete } from "../utils/openrouter.js";
import { chatPrompt } from "../prompts/chat.js";
import { config } from "../utils/config.js";

const { tokenName, model } = config.services.chat;

export class ChatAgent {
  constructor(private vault: TokenVault) {}

  async chat(userMessage: string): Promise<string> {
    const apiKey = this.vault.getApiKey(tokenName, model);
    const { text, tokens } = await complete(apiKey, model, chatPrompt(userMessage));
    this.vault.recordUsage(tokenName, model, tokens);
    return text;
  }
}
