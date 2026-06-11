import { callModel } from "./openrouter";
import { buildArbiterPrompt } from "../prompts/arbiter";
import config from "../../config.json";

export interface ArbiterResult {
  consistent: boolean;
  score: number;
  reasoning: string;
}

export async function runArbiter(
  question: string,
  answerA: string,
  answerB: string,
  wikipediaExcerpt: string | null
): Promise<ArbiterResult> {
  const prompt = buildArbiterPrompt(question, answerA, answerB, wikipediaExcerpt);
  const raw = await callModel<ArbiterResult>(config.models.arbiter, prompt);
  return {
    consistent: raw.consistent ?? false,
    score: typeof raw.score === "number" ? raw.score : 0,
    reasoning: raw.reasoning ?? "",
  };
}
