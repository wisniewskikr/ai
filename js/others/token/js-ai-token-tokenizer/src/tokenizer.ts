import { get_encoding, TiktokenEncoding } from 'tiktoken';
import { Message } from './api';

// cl100k_base is used by gpt-4, gpt-4o, gpt-3.5-turbo
const ENCODING: TiktokenEncoding = 'cl100k_base';
// Overhead per message (role + separators) and reply priming
const TOKENS_PER_MESSAGE = 4;
const TOKENS_REPLY_PRIMING = 3;

export function estimateTokens(messages: Message[]): number {
  const enc = get_encoding(ENCODING);
  let total = TOKENS_REPLY_PRIMING;
  for (const msg of messages) {
    total += TOKENS_PER_MESSAGE;
    total += enc.encode(msg.role).length;
    total += enc.encode(msg.content).length;
  }
  enc.free();
  return total;
}
