import * as fs from 'fs';
import * as path from 'path';

export function loadLines(dataFile: string): string[] {
  const fullPath = path.resolve(process.cwd(), dataFile);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}
