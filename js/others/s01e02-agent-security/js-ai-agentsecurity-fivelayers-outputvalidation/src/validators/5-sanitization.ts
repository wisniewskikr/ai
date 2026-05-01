import { ValidatorResult } from '../types';

export function validateSanitization(response: string, allowedDomains: string[]): ValidatorResult {
  let sanitized = response;

  const hadScript = /<script\b/i.test(response);
  const hadIframe = /<iframe\b/i.test(response);

  // Remove script and iframe blocks
  sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '[script removed]');
  sanitized = sanitized.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '[iframe removed]');

  // Remove remaining dangerous tags
  sanitized = sanitized.replace(/<(script|iframe|object|embed|form|input)\b[^>]*/gi, '');

  // Remove inline event handlers from any tags
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Fix malicious markdown links: [text](javascript:...)
  sanitized = sanitized.replace(/\[([^\]]+)\]\(javascript:[^)]*\)/gi, '[$1][link removed]');

  // Sanitize external URLs
  sanitized = sanitized.replace(/https?:\/\/([a-zA-Z0-9.\-]+)(\/[^\s)]*)*/g, (match, domain) => {
    const allowed = allowedDomains.some((d: string) => domain === d || domain.endsWith(`.${d}`));
    return allowed ? match : '[link removed]';
  });

  // Mask credit-card-like numbers that slipped through (e.g. after Luhn check passed)
  sanitized = sanitized.replace(
    /\b(\d{4})[\s\-](\d{4})[\s\-](\d{4})[\s\-](\d{4})\b/g,
    '$1 **** **** $4'
  );

  if (hadScript || hadIframe) {
    return {
      status: 'BLOCK',
      reason: 'script tag stripped, response sanitized before display',
      sanitizedText: sanitized,
    };
  }

  if (sanitized !== response) {
    return { status: 'SUSPICIOUS', reason: 'content was sanitized', sanitizedText: sanitized };
  }

  return { status: 'OK', sanitizedText: sanitized };
}
