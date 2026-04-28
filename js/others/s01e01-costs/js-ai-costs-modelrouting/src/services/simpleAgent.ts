import { sendRequest, ApiResponse } from '../utils/api';
import { Config } from '../utils/config';
import { simpleAgentSystemPrompt } from '../prompts/simpleAgentPrompt';
import { log } from '../utils/logger';

export async function handleSimpleQuery(query: string, config: Config): Promise<ApiResponse> {
  log('INFO', `Simple Agent handling query: "${query}"`);

  const response = await sendRequest(
    [
      { role: 'system', content: simpleAgentSystemPrompt },
      { role: 'user', content: query },
    ],
    config.simpleModel,
    config.baseUrl,
    config.maxTokens,
    config.temperature
  );

  log('INFO', `Simple Agent responded (${response.promptTokens} prompt + ${response.completionTokens} completion tokens)`);

  return response;
}
