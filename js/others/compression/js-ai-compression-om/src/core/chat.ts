import { logger } from '../utils/logger';
import { Config } from '../utils/config';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ApiResponse {
  reply: string;
  actualTokens: number;
}

export class ChatSession {
  private messages: Message[];
  private readonly apiKey: string;
  private readonly config: Config;

  constructor(config: Config, apiKey: string, systemPrompt: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.messages = [{ role: 'system', content: systemPrompt }];
  }

  // Simple heuristic: 4 characters ≈ 1 token (per spec §6)
  estimateTokens(): number {
    return Math.ceil(JSON.stringify(this.messages).length / 4);
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  async sendMessage(content: string): Promise<ApiResponse> {
    this.messages.push({ role: 'user', content });
    const response = await this.callApi(this.messages);
    this.messages.push({ role: 'assistant', content: response.reply });
    logger.info(`sendMessage complete. History length: ${this.messages.length}`);
    return response;
  }

  // Replace entire history with a single compressed system message.
  // The original system prompt and all raw messages are gone — that is the point.
  replaceWithCompressed(prose: string): void {
    this.messages = [{ role: 'system', content: prose }];
    logger.info('History replaced with compressed memory. Single system message remains.');
  }

  // Direct API call that bypasses session history management.
  // Used by the Reflector to compress observations without polluting the main history.
  async callApiDirect(messages: Message[]): Promise<ApiResponse> {
    return this.callApi(messages);
  }

  private async callApi(messages: Message[]): Promise<ApiResponse> {
    const url = `${this.config.openRouterBaseUrl}/chat/completions`;
    const body = {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokensPerRequest,
      temperature: this.config.temperature,
    };

    logger.debug(`API call → ${url} | ${messages.length} messages`);
    logger.debug(`Request:\n${JSON.stringify(body, null, 2)}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/js-ai-compression-om',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`API error ${response.status}: ${errorText}`);
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const json = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };

    logger.debug(`Response:\n${JSON.stringify(json, null, 2)}`);

    const reply = json.choices[0]?.message?.content?.trim() ?? '';
    const actualTokens = json.usage?.total_tokens ?? 0;

    return { reply, actualTokens };
  }
}
