import { ValidationResult } from '../services/pipeline';

const BANKING_KEYWORDS = [
  'balance', 'account', 'checking', 'savings',
  'transfer', 'transaction', 'history', 'payment',
  'deposit', 'interest', 'rate', 'term deposit',
  'card', 'credit', 'limit', 'installment', 'mortgage',
  'bank', 'contact', 'opening hours', 'helpline',
  'loan', 'debit', 'withdrawal', 'funds', 'statement',
  'iban', 'swift', 'pin', 'overdraft', 'salary',
];

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

// NFC normalization + lowercase to prevent unicode trick bypasses (e.g. ı → i)
function canonicalize(text: string): string {
  return text.normalize('NFC').toLowerCase();
}

function isBankingRelated(message: string): boolean {
  const normalized = canonicalize(message);
  return BANKING_KEYWORDS.some(keyword => normalized.includes(keyword));
}

// Backup language check: flag if non-ASCII chars dominate at a lower threshold
function looksNonEnglish(message: string): boolean {
  const chars = [...message];
  const nonAscii = chars.filter(c => c.charCodeAt(0) > 127).length;
  return nonAscii / chars.length > 0.15;
}

export function validateContextual(message: string): ValidationResult {
  const cleaned = stripHtml(message);

  if (looksNonEnglish(cleaned)) {
    return { status: 'BLOCK', reason: 'non-English message detected' };
  }

  if (!isBankingRelated(cleaned)) {
    return { status: 'BLOCK', reason: 'question not related to banking services' };
  }

  return { status: 'SAFE', reason: 'banking topic' };
}
