import { TokenVault } from "./token-vault.js";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

async function callOpenRouter(apiKey: string, model: string, prompt: string): Promise<{ text: string; tokens: number }> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 64,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
    usage: { total_tokens: number };
  };

  return {
    text: data.choices[0].message.content,
    tokens: data.usage.total_tokens,
  };
}

export class ChatAgent {
  private tokenName = "CHAT_TOKEN";
  private model = "anthropic/claude-haiku-4-5";

  constructor(private vault: TokenVault) {}

  async chat(prompt: string): Promise<string> {
    const apiKey = this.vault.getApiKey(this.tokenName, this.model);
    const { text, tokens } = await callOpenRouter(apiKey, this.model, prompt);
    this.vault.recordUsage(this.tokenName, this.model, tokens);
    return text;
  }
}

export class Analyzer {
  private tokenName = "ANALYZER_TOKEN";
  private model = "anthropic/claude-haiku-4-5";

  constructor(private vault: TokenVault) {}

  async analyze(text: string): Promise<string> {
    const apiKey = this.vault.getApiKey(this.tokenName, this.model);
    const { text: result, tokens } = await callOpenRouter(apiKey, this.model, `Analyze briefly: ${text}`);
    this.vault.recordUsage(this.tokenName, this.model, tokens);
    return result;
  }

  getTokenName(): string {
    return this.tokenName;
  }

  getModel(): string {
    return this.model;
  }
}

export class Writer {
  private tokenName = "WRITER_TOKEN";
  private model = "anthropic/claude-sonnet-4-6";

  constructor(private vault: TokenVault) {}

  async write(topic: string): Promise<string> {
    const apiKey = this.vault.getApiKey(this.tokenName, this.model);
    const { text, tokens } = await callOpenRouter(apiKey, this.model, `Write one sentence about: ${topic}`);
    this.vault.recordUsage(this.tokenName, this.model, tokens);
    return text;
  }
}
