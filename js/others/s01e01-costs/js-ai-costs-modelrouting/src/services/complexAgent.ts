import { sendRequest, ApiResponse } from '../utils/api';
import { Config } from '../utils/config';
import { complexAgentSystemPrompt } from '../prompts/complexAgentPrompt';
import { log } from '../utils/logger';

export async function handleComplexQuery(query: string, config: Config): Promise<ApiResponse> {
  log('INFO', `Complex Agent handling query: "${query}"`);

  const response = await sendRequest(
    [
      { role: 'system', content: complexAgentSystemPrompt },
      { role: 'user', content: query },
    ],
    config.complexModel,
    config.baseUrl,
    config.maxTokens,
    config.temperature
  );

  log('INFO', `Complex Agent responded (${response.promptTokens} prompt + ${response.completionTokens} completion tokens)`);

  return response;
}
