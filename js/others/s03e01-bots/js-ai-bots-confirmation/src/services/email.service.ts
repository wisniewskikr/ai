import * as fs from 'fs';
import * as path from 'path';

export function saveEmail(topic: string, content: string, emailsDir: string): string {
  const dir = path.join(process.cwd(), emailsDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .substring(0, 19);

  const filename = `${slug}-${timestamp}.txt`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}
