import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const promptTemplate = readFileSync(join(__dirname, '../prompts/scrape-feedback.md'), 'utf-8');

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function getAiFeedback(url: string, content: string): Promise<string> {
  const prompt = promptTemplate
    .replace('{{URL}}', url)
    .replace('{{CONTENT}}', content.slice(0, 2000));

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0]?.message?.content ?? 'No response from AI';
}
