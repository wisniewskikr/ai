import { knowledgeBase } from "../utils/knowledge-base.js";
import { plainDocument, enrichDocument } from "./enricher.js";
import { systemPrompt } from "../prompts/system.js";
import { buildPrompt } from "../prompts/question-context.js";
import { askAI } from "./ai-client.js";
import { log } from "../utils/logger.js";

export async function compareContexts(question: string): Promise<void> {
  console.log(`\nQuestion: "${question}"\n`);
  console.log("=".repeat(60));

  // Step 1: Plain context
  console.log("\n--- STEP 1: PLAIN CONTEXT SENT TO AI ---");
  const plainContext = knowledgeBase.map(plainDocument).join("\n");
  console.log(plainContext);
  console.log("\nQuerying AI with plain context...");

  log("INFO", `Question (plain context): ${question}`);
  const plainAnswer = await askAI(systemPrompt, buildPrompt(question, plainContext));

  console.log(`\nAnswer: "${plainAnswer}"`);
  log("INFO", `Plain answer: ${plainAnswer}`);

  // Step 2: Show enriched documents
  console.log("\n--- STEP 2: ENRICHING DOCUMENTS... ---");
  const enrichedContext = knowledgeBase.map(enrichDocument).join("\n\n");
  console.log(enrichedContext);

  // Step 3: Enriched context
  console.log("\n--- STEP 3: ENRICHED CONTEXT SENT TO AI ---");
  console.log("\nQuerying AI with enriched context...");

  log("INFO", `Question (enriched context): ${question}`);
  const enrichedAnswer = await askAI(systemPrompt, buildPrompt(question, enrichedContext));

  console.log(`\nAnswer: "${enrichedAnswer}"`);
  log("INFO", `Enriched answer: ${enrichedAnswer}`);

  console.log("\n--- TAKEAWAY ---");
  console.log("Context enrichment revealed dependencies invisible in plain text.");
  console.log("=".repeat(60));
}
