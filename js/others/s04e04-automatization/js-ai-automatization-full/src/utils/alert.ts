import { logger } from './logger';

export async function sendAlert(message: string): Promise<void> {
  logger.error(`ALERT: ${message}`);

  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackUrl) return;

  try {
    await fetch(slackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `[Agent Alert] ${message}` }),
    });
  } catch (err) {
    logger.error(`Failed to send Slack alert: ${(err as Error).message}`);
  }
}
