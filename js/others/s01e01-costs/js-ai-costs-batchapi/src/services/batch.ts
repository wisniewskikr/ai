import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { classifyPrompt } from '../prompts/classify.js';
import type { Review, ReviewResult } from './standard.js';

export interface BatchResult {
  results: ReviewResult[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  durationMs: number;
}

function buildBatchLine(review: Review, model: string): string {
  return JSON.stringify({
    custom_id: `review-${review.id}`,
    method: 'POST',
    url: '/v1/chat/completions',
    body: {
      model,
      messages: [
        { role: 'system', content: classifyPrompt },
        { role: 'user', content: review.text },
      ],
      max_tokens: 5,
    },
  });
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function runBatchApi(
  reviews: Review[],
  client: OpenAI,
  model: string,
  pollIntervalMs: number,
  maxWaitMs: number,
  inputCostPer1M: number,
  outputCostPer1M: number,
  batchCostMultiplier: number,
): Promise<BatchResult> {
  const start = Date.now();

  // Build and upload JSONL file
  logger.info(`Batch API: building JSONL with ${reviews.length} requests`);
  const jsonl = reviews.map((r) => buildBatchLine(r, model)).join('\n');
  const blob = new Blob([jsonl], { type: 'application/json' });
  const file = new File([blob], 'batch.jsonl', { type: 'application/json' });

  const uploadedFile = await client.files.create({ file, purpose: 'batch' });
  logger.info(`File uploaded: ${uploadedFile.id}`);

  // Create batch job
  const batch = await client.batches.create({
    input_file_id: uploadedFile.id,
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
  });
  logger.info(`Batch created: ${batch.id}. Waiting for results...`);

  // Poll until complete
  let current = batch;
  while (
    current.status === 'validating' ||
    current.status === 'in_progress' ||
    current.status === 'finalizing'
  ) {
    const elapsed = Date.now() - start;
    if (elapsed > maxWaitMs) {
      throw new Error(`Batch timed out after ${(maxWaitMs / 1000).toFixed(0)}s`);
    }
    logger.info(`[polling] Status: ${current.status}... (${(elapsed / 1000).toFixed(0)}s elapsed)`);
    await sleep(pollIntervalMs);
    current = await client.batches.retrieve(batch.id);
  }

  if (current.status !== 'completed') {
    throw new Error(`Batch ended with status: ${current.status}`);
  }
  logger.info('Batch completed!');

  // Download and parse results
  const outputFileId = current.output_file_id;
  if (!outputFileId) {
    throw new Error('Batch completed but output_file_id is missing');
  }

  const fileContent = await client.files.content(outputFileId);
  const text = await fileContent.text();
  const lines = text.trim().split('\n').filter(Boolean);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const results: ReviewResult[] = [];

  for (const line of lines) {
    const parsed = JSON.parse(line) as {
      custom_id: string;
      response: {
        body: {
          choices: { message: { content: string } }[];
          usage: { prompt_tokens: number; completion_tokens: number };
        };
      };
    };
    const id = parseInt(parsed.custom_id.replace('review-', ''), 10);
    const sentiment =
      parsed.response.body.choices[0].message.content?.trim().toLowerCase() ?? 'unknown';
    const usage = parsed.response.body.usage;
    totalInputTokens += usage?.prompt_tokens ?? 0;
    totalOutputTokens += usage?.completion_tokens ?? 0;

    const original = reviews.find((r) => r.id === id);
    results.push({ id, text: original?.text ?? '', sentiment });
  }

  results.sort((a, b) => a.id - b.id);

  const durationMs = Date.now() - start;
  const totalCost =
    ((totalInputTokens / 1_000_000) * inputCostPer1M +
      (totalOutputTokens / 1_000_000) * outputCostPer1M) *
    batchCostMultiplier;

  logger.info(`Batch API done. Duration: ${(durationMs / 1000).toFixed(1)}s, Cost: $${totalCost.toFixed(6)}`);

  return { results, totalInputTokens, totalOutputTokens, totalCost, durationMs };
}
