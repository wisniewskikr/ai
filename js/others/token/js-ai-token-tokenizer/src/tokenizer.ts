import { get_encoding, encoding_for_model, TiktokenEncoding, TiktokenModel } from 'tiktoken';
import { Message } from './api';

// 3 tokens per message overhead + 3 tokens reply priming (per OpenAI Cookbook)
const TOKENS_PER_MESSAGE = 3;
const TOKENS_REPLY_PRIMING = 3;

// OpenRouter uses "provider/model" format, e.g. "openai/gpt-4o"
// Strip provider prefix to get the bare model name for tiktoken
function resolveEncoding(model: string) {
  const bareModel = model.includes('/') ? model.split('/').slice(1).join('/') : model;
  try {
    return encoding_for_model(bareModel as TiktokenModel);
  } catch {
    // Fall back to o200k_base (gpt-4o family) then cl100k_base
    try {
      return get_encoding('o200k_base' as TiktokenEncoding);
    } catch {
      return get_encoding('cl100k_base');
    }
  }
}

export function estimateTokens(messages: Message[], model: string): number {
  const enc = resolveEncoding(model);
  let total = TOKENS_REPLY_PRIMING;
  for (const msg of messages) {
    total += TOKENS_PER_MESSAGE;
    total += enc.encode(msg.role).length;
    total += enc.encode(msg.content).length;
  }
  enc.free();
  return total;
}
