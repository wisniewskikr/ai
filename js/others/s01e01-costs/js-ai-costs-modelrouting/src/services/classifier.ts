import { sendRequest } from '../utils/api';
import { Config } from '../utils/config';
import { classifierSystemPrompt } from '../prompts/classifierPrompt';
import { log } from '../utils/logger';

export type QueryType = 'simple' | 'complex';

export interface ClassifierResult {
  queryType: QueryType;
  promptTokens: number;
  completionTokens: number;
}

export async function classifyQuery(query: string, config: Config): Promise<ClassifierResult> {
  log('INFO', `Classifying query: "${query}"`);

  const response = await sendRequest(
    [
      { role: 'system', content: classifierSystemPrompt },
      { role: 'user', content: query },
    ],
    config.classifierModel,
    config.baseUrl,
    10,  // one word response only
    0    // deterministic classification
  );

  const raw = response.content.trim().toLowerCase();
  const queryType: QueryType = raw === 'simple' ? 'simple' : 'complex';

  log('INFO', `Classification: ${queryType} (raw: "${raw}")`);

  return {
    queryType,
    promptTokens: response.promptTokens,
    completionTokens: response.completionTokens,
  };
}
