import fs from 'fs';
import path from 'path';
import config from '../../config.json';

export function scanWorkspace(): string[] {
  const workspacePath = path.resolve(config.workspaceDir);

  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
    return [];
  }

  return fs.readdirSync(workspacePath).filter((name) => {
    const stat = fs.statSync(path.join(workspacePath, name));
    return stat.isFile();
  });
}
