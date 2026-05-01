import { ValidatorResult, ValidationContext } from '../types';

// Sets of keywords — if 2+ match with no banking keywords, response is off-topic
const OFF_TOPIC_SETS = [
  ['recipe', 'cooking', 'ingredient', 'pasta', 'cuisine', 'dish', 'chef', 'bake', 'fry', 'boil'],
  ['weather', 'forecast', 'temperature', 'rain', 'sunny', 'snow', 'wind', 'humidity'],
  ['sports', 'football', 'basketball', 'soccer', 'tournament', 'score', 'match', 'athlete'],
  ['movie', 'film', 'actor', 'actress', 'director', 'cinema', 'streaming', 'series'],
  ['music', 'song', 'band', 'concert', 'album', 'playlist', 'spotify'],
  ['politics', 'election', 'president', 'government', 'parliament', 'minister', 'vote'],
];

const BANKING_KEYWORDS = [
  'account', 'balance', 'transfer', 'payment', 'loan', 'credit', 'debit',
  'deposit', 'bank', 'transaction', 'pln', 'eur', 'iban', 'card', 'mortgage',
  'interest', 'rate', 'saldo', 'konto', 'przelew', 'rachunek', 'rata', 'kredyt',
];

function isOffTopic(text: string): boolean {
  const lower = text.toLowerCase();
  const hasBanking = BANKING_KEYWORDS.some(kw => lower.includes(kw));
  if (hasBanking) return false;

  for (const keywords of OFF_TOPIC_SETS) {
    const hits = keywords.filter(kw => lower.includes(kw));
    if (hits.length >= 2) return true;
  }

  return false;
}

// Check if response mentions an IBAN that doesn't belong to the current client
function hasUnknownIban(response: string, context: ValidationContext): boolean {
  const ibanRe = /PL\d{2}\s?\d{4}\s?\d{4}\s?\d{4}/gi;
  const mentioned = response.match(ibanRe) ?? [];
  const clientIbans = context.client.accounts.map(a => a.iban.replace(/\s/g, '').toUpperCase());

  for (const iban of mentioned) {
    const normalized = iban.replace(/\s/g, '').toUpperCase();
    if (!clientIbans.includes(normalized)) return true;
  }

  return false;
}

export function validateContextual(response: string, context: ValidationContext): ValidatorResult {
  if (isOffTopic(response)) {
    return { status: 'BLOCK', reason: 'response off-topic for a bank assistant' };
  }

  if (hasUnknownIban(response, context)) {
    return { status: 'SUSPICIOUS', reason: 'response contains IBAN not associated with current client' };
  }

  return { status: 'OK' };
}
