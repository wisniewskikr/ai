import robotsParser from 'robots-parser';
import { config } from '../config.js';

const userAgent = `${config.scraperName} (${config.scraperEmail})`;

export async function isAllowedByRobots(url: string): Promise<boolean> {
  const { origin } = new URL(url);
  const robotsUrl = `${origin}/robots.txt`;

  try {
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    if (!response.ok) {
      // No robots.txt or inaccessible — default allow
      return true;
    }

    const text = await response.text();
    const robots = robotsParser(robotsUrl, text);
    const allowed = robots.isAllowed(url, userAgent);

    // null = not specified by any rule — default allow
    return allowed !== false;
  } catch {
    // Network error fetching robots.txt — default allow
    return true;
  }
}
