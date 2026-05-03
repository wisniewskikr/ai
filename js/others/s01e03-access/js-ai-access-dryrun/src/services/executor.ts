import fs from 'fs';
import path from 'path';
import config from '../../config.json';
import { MoveOperation } from './planner';
import { logger } from '../utils/logger';

export function executeOperations(operations: MoveOperation[]): void {
  const workspacePath = path.resolve(config.workspaceDir);

  for (const op of operations) {
    const sourcePath = path.join(workspacePath, op.source);
    const destPath = path.join(workspacePath, op.destination);
    const destDir = path.dirname(destPath);

    try {
      fs.mkdirSync(destDir, { recursive: true });
      fs.renameSync(sourcePath, destPath);
      console.log(`[OK] ${op.source} → ${op.destination}`);
      logger.info(`MOVE "${op.source}" → "${op.destination}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[ERR] ${op.source}: ${message}`);
      logger.error(`MOVE FAILED "${op.source}": ${message}`);
    }
  }

  console.log(`\nLogged to ${config.auditLogFile}`);
}
