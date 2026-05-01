import { ValidatorResult } from '../types';
import { isValidLuhn } from '../utils/luhn';
import config from '../config';

// Non-global regexes for .test() — safe to call repeatedly
const SYSTEM_LEAK_RE = /(\[SYSTEM\]|You are a bank assistant|system prompt)/i;
const INJECTION_RE = /(ignore previous|new task:|forget everything|override instructions|disregard all previous)/i;
const EXEC_CODE_RE = /\b(eval\s*\(|exec\s*\(|system\s*\(|subprocess|os\.system|shell_exec)\b/i;
const API_KEY_RE = /\bsk-[a-zA-Z0-9]{20,}\b|Bearer\s+[a-zA-Z0-9\-_.]{20,}/i;
const PESEL_RE = /(?<!\d)\d{11}(?!\d)/;
const HTML_TAG_RE = /<[a-zA-Z][^>]*>/;

// Global regexes for matchAll
const CREDIT_CARD_RE = /\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/g;
const URL_RE = /https?:\/\/([a-zA-Z0-9.\-]+)(\/[^\s)]*)?/g;

export function validatePattern(response: string): ValidatorResult {
  // Highest severity checks first
  if (INJECTION_RE.test(response)) {
    return { status: 'BLOCK', reason: 'prompt injection relay detected' };
  }

  if (SYSTEM_LEAK_RE.test(response)) {
    return { status: 'BLOCK', reason: 'system prompt content detected in response' };
  }

  if (EXEC_CODE_RE.test(response)) {
    return { status: 'BLOCK', reason: 'executable code pattern detected' };
  }

  if (API_KEY_RE.test(response)) {
    return { status: 'BLOCK', reason: 'API key or token detected' };
  }

  // Credit card number with Luhn validation
  const cardMatches = [...response.matchAll(CREDIT_CARD_RE)];
  for (const match of cardMatches) {
    const digits = match[1].replace(/[\s\-]/g, '');
    if (isValidLuhn(digits)) {
      return { status: 'BLOCK', reason: 'credit card number pattern (Luhn valid)' };
    }
  }

  // PESEL (11-digit national ID)
  if (PESEL_RE.test(response)) {
    return { status: 'BLOCK', reason: 'potential PESEL (national ID) number detected' };
  }

  // External URLs
  const urlMatches = [...response.matchAll(URL_RE)];
  for (const match of urlMatches) {
    const domain = match[1];
    const allowed = config.allowedDomains.some((d: string) => domain === d || domain.endsWith(`.${d}`));
    if (!allowed) {
      return { status: 'SUSPICIOUS', reason: `external URL detected: ${domain}` };
    }
  }

  // HTML tags — suspicious, layer 5 will sanitize
  if (HTML_TAG_RE.test(response)) {
    return { status: 'SUSPICIOUS', reason: 'HTML tag detected' };
  }

  return { status: 'OK' };
}
