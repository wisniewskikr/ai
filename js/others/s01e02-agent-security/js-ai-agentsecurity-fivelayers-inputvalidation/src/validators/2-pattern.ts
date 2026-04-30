import { ValidationResult } from '../services/pipeline';

interface PatternRule {
  pattern: RegExp;
  reason: string;
}

// Certain BLOCK — classic injection patterns
const BLOCK_RULES: PatternRule[] = [
  { pattern: /ignore\s+(previous|all|prior)\s+(instructions?|prompts?|commands?)/i, reason: 'classic prompt injection phrase' },
  { pattern: /forget\s+(your|all|the)\s+(instructions?|prompts?|commands?|previous)/i, reason: 'instruction erasure attempt' },
  { pattern: /new\s+task\s*:/i, reason: 'task hijacking attempt' },
  { pattern: /\bsystem\s*:\s/i, reason: 'system prompt injection' },
  { pattern: /you\s+are\s+now\s+(a|an)\s+/i, reason: 'role-change attempt' },
  { pattern: /\bact\s+as\s+(a|an)\s+/i, reason: 'role-change attempt' },
  { pattern: /pretend\s+(you\s+are|to\s+be)/i, reason: 'role-change attempt' },
  { pattern: /roleplay\s+as/i, reason: 'role-change attempt' },
  { pattern: /repeat\s+your\s+(prompt|instructions?|system)/i, reason: 'system prompt extraction' },
  { pattern: /what\s+are\s+your\s+instructions?/i, reason: 'system prompt extraction' },
  { pattern: /show\s+(me\s+)?your\s+system\s+prompt/i, reason: 'system prompt extraction' },
  { pattern: /\n\nHuman:/i, reason: 'escape sequence injection' },
  { pattern: /\n\nAssistant:/i, reason: 'escape sequence injection' },
  { pattern: /<\|im_start\|>/i, reason: 'escape sequence injection' },
  // base64 payload: long base64 string is suspicious
  { pattern: /[A-Za-z0-9+/]{60,}={0,2}/, reason: 'potential base64-encoded payload' },
  // hex-encoded instructions: many hex bytes in sequence
  { pattern: /(?:0x[0-9a-fA-F]{2}\s*){8,}/, reason: 'potential hex-encoded instruction' },
];

// Partial matches — flag as SUSPICIOUS
const SUSPICIOUS_RULES: PatternRule[] = [
  { pattern: /\bprompt\b/i, reason: 'prompt-related term' },
  { pattern: /\bsystem\s+prompt\b/i, reason: 'system-prompt reference' },
  { pattern: /\byour\s+instructions?\b/i, reason: 'instructions reference' },
  { pattern: /DAN\b/, reason: 'known jailbreak keyword' },
];

export function validatePattern(message: string): ValidationResult {
  for (const { pattern, reason } of BLOCK_RULES) {
    if (pattern.test(message)) {
      return { status: 'BLOCK', reason: `matched: "${reason}"` };
    }
  }

  for (const { pattern, reason } of SUSPICIOUS_RULES) {
    if (pattern.test(message)) {
      return { status: 'SUSPICIOUS', reason: `suspicious term: "${reason}"` };
    }
  }

  return { status: 'SAFE', reason: 'OK' };
}
