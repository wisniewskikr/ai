import { callModel, ModelResponse } from "./openrouter";
import { buildVerifyPrompt } from "../prompts/verify";
import config from "../../config.json";

export interface VerificationResult {
  modelA: ModelResponse;
  modelB: ModelResponse;
}

export async function verifyQuestion(question: string): Promise<VerificationResult> {
  const prompt = buildVerifyPrompt(question);

  const [modelA, modelB] = await Promise.all([
    callModel<ModelResponse>(config.models.modelA, prompt),
    callModel<ModelResponse>(config.models.modelB, prompt),
  ]);

  return { modelA, modelB };
}
