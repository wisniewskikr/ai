import { ValidatorResult } from '../types';
import { callModel } from '../openrouter';
import { getJudgePrompt } from '../prompts/judge';
import { logger } from '../utils/logger';
import config from '../config';

export async function validateSemantic(response: string): Promise<ValidatorResult> {
  const judgePrompt = getJudgePrompt(response);

  let judgment: string;
  try {
    judgment = await callModel(
      config.judgeModel,
      [{ role: 'user', content: judgePrompt }],
      config.maxTokens.judge
    );
  } catch (error) {
    logger.error(`Semantic validator (judge) call failed: ${error}`);
    // Fail safe: treat as suspicious when judge is unavailable
    return { status: 'SUSPICIOUS', reason: 'semantic validation unavailable' };
  }

  const word = judgment.trim().toUpperCase().split(/\s/)[0];

  if (word === 'BLOCK') {
    return { status: 'BLOCK', reason: 'response classified as containing external instructions or unsafe content' };
  }

  if (word === 'SUSPICIOUS') {
    return { status: 'SUSPICIOUS', reason: 'response semantically suspicious' };
  }

  return { status: 'SAFE' };
}
