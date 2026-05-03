import OpenAI from 'openai';
import config from '../../config.json';
import { PLANNER_SYSTEM_PROMPT } from '../prompts/planner';

export interface MoveOperation {
  action: 'MOVE';
  source: string;
  destination: string;
}

export interface Plan {
  operations: MoveOperation[];
}

const client = new OpenAI({
  baseURL: config.openRouterBaseUrl,
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function createPlan(files: string[]): Promise<Plan> {
  const userMessage = `Organize these files:\n${files.map((f) => `- ${f}`).join('\n')}`;

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });

  const content = response.choices[0].message.content ?? '';

  // Extract JSON — handles cases where model wraps it in markdown code blocks
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM did not return valid JSON');

  return JSON.parse(match[0]) as Plan;
}
