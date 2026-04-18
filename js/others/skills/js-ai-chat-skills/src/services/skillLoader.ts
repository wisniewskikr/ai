import * as fs from 'fs';
import * as path from 'path';

export function loadSkill(skillFile: string): string {
  const skillPath = path.join(process.cwd(), 'src', 'prompts', skillFile);
  return fs.readFileSync(skillPath, 'utf-8').trim();
}
