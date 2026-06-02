import OpenAI from 'openai';
import { SYSTEM_PROMPT, buildUserMessage } from '../prompts/classify';

export interface ClassificationResult {
  topic: string;
  sensitivity: 'low' | 'medium' | 'high';
  decision: 'cloud' | 'local';
  reason: string;
}

function stripThinkingTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function parseClassification(rawResponse: string): ClassificationResult {
  const clean = stripThinkingTags(rawResponse);

  // Extract JSON block if wrapped in markdown code fences
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in LLM response: ${clean}`);
  }

  const parsed = JSON.parse(jsonMatch[0]) as ClassificationResult;

  if (!parsed.decision || !parsed.sensitivity || !parsed.topic) {
    throw new Error(`Incomplete classification response: ${jsonMatch[0]}`);
  }

  return parsed;
}

export async function classify(
  transcript: string,
  baseUrl: string,
  model: string,
  temperature: number,
  maxTokens: number,
): Promise<ClassificationResult> {
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey: 'not-required', // LM Studio does not require a key
  });

  const response = await client.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(transcript) },
    ],
  });

  const content = response.choices[0]?.message?.content ?? '';
  return parseClassification(content);
}
