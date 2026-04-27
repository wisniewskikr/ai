import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { classifyPrompt } from '../prompts/classify.js';

export interface Review {
  id: number;
  text: string;
}

export interface ReviewResult {
  id: number;
  text: string;
  sentiment: string;
}

export interface StandardResult {
  results: ReviewResult[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  durationMs: number;
}

export async function runStandardApi(
  reviews: Review[],
  client: OpenAI,
  model: string,
  inputCostPer1M: number,
  outputCostPer1M: number,
): Promise<StandardResult> {
  const results: ReviewResult[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const start = Date.now();

  logger.info(`Standard API: sending ${reviews.length} requests sequentially`);

  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: classifyPrompt },
        { role: 'user', content: review.text },
      ],
      max_tokens: 5,
    });

    const sentiment = response.choices[0].message.content?.trim().toLowerCase() ?? 'unknown';
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;

    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;

    results.push({ id: review.id, text: review.text, sentiment });
    logger.info(`[${i + 1}/${reviews.length}] "${review.text.slice(0, 50)}..." -> ${sentiment}`);
  }

  const durationMs = Date.now() - start;
  const totalCost =
    (totalInputTokens / 1_000_000) * inputCostPer1M +
    (totalOutputTokens / 1_000_000) * outputCostPer1M;

  logger.info(`Standard API done. Duration: ${(durationMs / 1000).toFixed(1)}s, Cost: $${totalCost.toFixed(6)}`);

  return { results, totalInputTokens, totalOutputTokens, totalCost, durationMs };
}
