import 'dotenv/config';
import { scanWorkspace } from './services/scanner';
import { createPlan } from './services/planner';
import { executeOperations } from './services/executor';
import { askConfirmation } from './utils/cli';
import { logger } from './utils/logger';

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Missing OPENROUTER_API_KEY in .env file');
    process.exit(1);
  }

  console.log('Scanning workspace/...');
  const files = scanWorkspace();

  if (files.length === 0) {
    console.log('No files found in workspace/ to organize.');
    return;
  }

  console.log(`Found ${files.length} file(s). Creating plan...\n`);
  logger.info(`Scan: found ${files.length} file(s)`);

  let plan;
  try {
    plan = await createPlan(files);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create plan: ${message}`);
    logger.error(`Plan failed: ${message}`);
    process.exit(1);
  }

  if (!plan.operations || plan.operations.length === 0) {
    console.log('LLM returned no operations.');
    return;
  }

  console.log(`Planning ${plan.operations.length} operation(s):\n`);
  for (const op of plan.operations) {
    console.log(`  [${op.action}] ${op.source.padEnd(35)} →  ${op.destination}`);
  }

  console.log();
  const confirmed = await askConfirmation('Continue? [yes/no]: ');

  if (!confirmed) {
    console.log('\nAborted. No files were changed.');
    logger.info('Plan rejected by user');
    return;
  }

  console.log();
  logger.info(`User approved plan (${plan.operations.length} operation(s))`);
  executeOperations(plan.operations);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
