import { Config } from '../utils/config';
import { log } from '../utils/logger';
import { classifyQuery } from './classifier';
import { handleSimpleQuery } from './simpleAgent';
import { handleComplexQuery } from './complexAgent';

export interface RouterResult {
  answer: string;
  agentUsed: string;
  queryType: 'simple' | 'complex';
  estimatedCostUsd: number;
}

function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
  pricing: Config['pricing']
): number {
  const p = pricing[model];
  if (!p) return 0;
  return (promptTokens * p.inputPerM + completionTokens * p.outputPerM) / 1_000_000;
}

export async function routeQuery(query: string, config: Config): Promise<RouterResult> {
  const classification = await classifyQuery(query, config);

  const classifierCost = calculateCost(
    config.classifierModel,
    classification.promptTokens,
    classification.completionTokens,
    config.pricing
  );

  let agentResponse;
  let agentModel: string;

  if (classification.queryType === 'simple') {
    agentResponse = await handleSimpleQuery(query, config);
    agentModel = config.simpleModel;
  } else {
    agentResponse = await handleComplexQuery(query, config);
    agentModel = config.complexModel;
  }

  const agentCost = calculateCost(
    agentModel,
    agentResponse.promptTokens,
    agentResponse.completionTokens,
    config.pricing
  );

  const totalCost = classifierCost + agentCost;

  log('INFO', `Routing complete — type: ${classification.queryType}, agent: ${agentModel}, cost: $${totalCost.toFixed(6)}`);

  return {
    answer: agentResponse.content,
    agentUsed: agentModel,
    queryType: classification.queryType,
    estimatedCostUsd: totalCost,
  };
}
