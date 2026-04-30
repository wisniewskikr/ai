import { ValidationResult } from '../services/pipeline';
import config from '../../config.json';

// In-memory rate limiter: tracks request timestamps for the current session
const requestTimestamps: number[] = [];

export function validateStructural(message: string): ValidationResult {
  const { minLength, maxLength, nonAsciiRatioThreshold, rateLimitPerMinute } =
    config.validation;

  if (message.length < minLength) {
    return { status: 'BLOCK', reason: `Message too short (min ${minLength} chars)` };
  }

  if (message.length > maxLength) {
    return { status: 'BLOCK', reason: `Message too long (${message.length} chars, max ${maxLength})` };
  }

  // Reject null bytes and control characters except \t \n \r
  for (const char of message) {
    const code = char.charCodeAt(0);
    if (code === 0 || (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d)) {
      return { status: 'BLOCK', reason: 'Message contains invalid control characters' };
    }
  }

  // Language detection: reject if non-ASCII characters dominate
  const chars = [...message];
  const nonAsciiCount = chars.filter(c => c.charCodeAt(0) > 127).length;
  const ratio = nonAsciiCount / chars.length;
  if (ratio > nonAsciiRatioThreshold) {
    return { status: 'BLOCK', reason: 'Non-ASCII character ratio exceeds threshold (English only)' };
  }

  // Rate limiting: max N requests per minute per session
  const now = Date.now();
  const cutoff = now - 60_000;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= rateLimitPerMinute) {
    return { status: 'BLOCK', reason: `Rate limit exceeded (max ${rateLimitPerMinute} requests/minute)` };
  }
  requestTimestamps.push(now);

  return { status: 'SAFE', reason: `OK (${message.length} chars)` };
}
