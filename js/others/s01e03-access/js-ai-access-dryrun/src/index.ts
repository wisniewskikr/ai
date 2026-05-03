import 'dotenv/config';
import { scanWorkspace } from './services/scanner';
import { createPlan } from './services/planner';
import { executeOperations } from './services/executor';
import { askConfirmation } from './utils/cli';
import { logger } from './utils/logger';

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Brakuje OPENROUTER_API_KEY w pliku .env');
    process.exit(1);
  }

  console.log('Skanowanie workspace/...');
  const files = scanWorkspace();

  if (files.length === 0) {
    console.log('Brak plikow w workspace/ do zorganizowania.');
    return;
  }

  console.log(`Znaleziono ${files.length} plik(ow). Tworzenie planu...\n`);
  logger.info(`Scan: znaleziono ${files.length} plikow`);

  let plan;
  try {
    plan = await createPlan(files);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Blad tworzenia planu: ${message}`);
    logger.error(`Plan failed: ${message}`);
    process.exit(1);
  }

  if (!plan.operations || plan.operations.length === 0) {
    console.log('LLM nie zaproponowal zadnych operacji.');
    return;
  }

  console.log(`Zamierzam wykonac ${plan.operations.length} operacji:\n`);
  for (const op of plan.operations) {
    console.log(`  [${op.action}] ${op.source.padEnd(35)} →  ${op.destination}`);
  }

  console.log();
  const confirmed = await askConfirmation('Czy kontynuowac? [tak/nie]: ');

  if (!confirmed) {
    console.log('\nAnulowano. Zadne pliki nie zostaly zmienione.');
    logger.info('Plan odrzucony przez uzytkownika');
    return;
  }

  console.log();
  logger.info(`Uzytkownik zatwierdził plan (${plan.operations.length} operacji)`);
  executeOperations(plan.operations);
}

main().catch((err) => {
  console.error('Nieoczekiwany blad:', err);
  process.exit(1);
});
