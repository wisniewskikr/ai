import { callLLM } from "../utils/llm";
import { AppConfig } from "../types";

const SYSTEM_PROMPT = `You are a precise summarizer.
Summarize the given text in 2-3 sentences maximum.
Keep only the most important information.
Return ONLY the summary — no labels, no preamble, no "Summary:" prefix.`;

export async function summarize(text: string, config: AppConfig): Promise<string> {
  return callLLM(text, SYSTEM_PROMPT, config);
}
