import { config } from '../config.js';

const userAgent = `${config.scraperName} (${config.scraperEmail})`;

export type ScrapeResult =
  | { ok: true; content: string }
  | { ok: false; reason: 'rate-limited' | 'error'; message: string };

export async function fetchPage(url: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    if (response.status === 429) {
      return { ok: false, reason: 'rate-limited', message: 'Server says: slow down (HTTP 429)' };
    }

    if (!response.ok) {
      return { ok: false, reason: 'error', message: `HTTP ${response.status}: ${response.statusText}` };
    }

    const content = await response.text();
    return { ok: true, content };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: 'error', message };
  }
}
