import { ValidatorResult } from '../types';
import config from '../config';

export function validateStructural(response: string): ValidatorResult {
  if (response.length < config.minResponseLength) {
    return { status: 'BLOCK', reason: `response too short (${response.length} chars, min ${config.minResponseLength})` };
  }

  if (response.length > config.maxResponseLength) {
    return { status: 'BLOCK', reason: `response too long (${response.length} chars, max ${config.maxResponseLength})` };
  }

  // Reject null bytes and control characters except \t (9), \n (10), \r (13)
  for (let i = 0; i < response.length; i++) {
    const code = response.charCodeAt(i);
    if (code === 0 || (code < 0x20 && code !== 9 && code !== 10 && code !== 13)) {
      return { status: 'BLOCK', reason: `invalid control character at position ${i} (0x${code.toString(16)})` };
    }
  }

  return { status: 'OK' };
}
