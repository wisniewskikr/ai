import fs from 'fs';
import path from 'path';

export function scanAudioFiles(workspaceDir: string, supportedExtensions: string[]): string[] {
  if (!fs.existsSync(workspaceDir)) {
    return [];
  }

  return fs
    .readdirSync(workspaceDir)
    .filter((file) => supportedExtensions.includes(path.extname(file).toLowerCase()))
    .map((file) => path.resolve(workspaceDir, file));
}
