import chalk from 'chalk';
import Table from 'cli-table3';
import { getRecentLogs } from './logger.js';
import config from '../../config.json' with { type: 'json' };

function colorStatus(status: string): string {
  switch (status) {
    case 'OK':     return chalk.green(status);
    case 'DENIED': return chalk.red(status);
    case 'ERROR':  return chalk.redBright(status);
    default:       return chalk.gray(status);
  }
}

export function showLogs(limit = config.viewer.defaultLimit): void {
  const logs = getRecentLogs(limit).reverse();

  const table = new Table({
    head: ['#', 'Timestamp', 'Action', 'Input', 'Result', 'Status'].map(h => chalk.bold(h)),
    colWidths: [5, 22, 22, 35, 40, 10],
    wordWrap: true,
  });

  for (const entry of logs) {
    table.push([
      String(entry.id),
      entry.timestamp,
      entry.action,
      entry.input,
      entry.result,
      colorStatus(entry.status),
    ]);
  }

  console.log(chalk.bold('\n=== Audit Log ==='));
  if (logs.length === 0) {
    console.log(chalk.gray('  No entries yet.'));
    return;
  }
  console.log(table.toString());
  console.log(chalk.gray(`\nShowing ${logs.length} entries (newest last).`));
}
