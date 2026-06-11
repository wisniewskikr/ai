import { callLLM } from "../utils/llm";
import { AppConfig } from "../types";

const SYSTEM_PROMPT = `You are a professional translator.
Translate the given text accurately and naturally.
Return ONLY the translation — no explanations, no original text, no labels.`;

export async function translateText(
  text: string,
  targetLanguage: string,
  config: AppConfig
): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;
  const translation = await callLLM(prompt, SYSTEM_PROMPT, config);
  return translation.trim();
}
