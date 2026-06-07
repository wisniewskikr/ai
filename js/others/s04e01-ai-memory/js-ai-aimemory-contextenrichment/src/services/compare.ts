import { knowledgeBase } from "../utils/knowledge-base.js";
import { plainDocument, enrichDocument } from "./enricher.js";
import { systemPrompt } from "../prompts/system.js";
import { buildPrompt } from "../prompts/question-context.js";
import { askAI } from "./ai-client.js";
import { log } from "../utils/logger.js";

export async function compareContexts(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"`);
  console.log("\nWorking...");

  const plainContext = knowledgeBase.map(plainDocument).join("\n");
  log("INFO", `Question (plain context): ${question}`);
  const plainAnswer = await askAI(systemPrompt, buildPrompt(question, plainContext));
  log("INFO", `Plain answer: ${plainAnswer}`);

  const enrichedContext = knowledgeBase.map(enrichDocument).join("\n\n");
  log("INFO", `Question (enriched context): ${question}`);
  const enrichedAnswer = await askAI(systemPrompt, buildPrompt(question, enrichedContext));
  log("INFO", `Enriched answer: ${enrichedAnswer}`);

  console.log("\n" + "=".repeat(60));
  console.log("\nWITHOUT context enrichment:");
  console.log(`"${plainAnswer}"`);
  console.log("\nWITH context enrichment:");
  console.log(`"${enrichedAnswer}"`);
  console.log("\nTakeaway: context enrichment revealed dependencies invisible in plain text.");
  console.log("\n" + "=".repeat(60));
}
