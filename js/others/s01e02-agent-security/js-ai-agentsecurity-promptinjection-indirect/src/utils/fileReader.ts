import * as fs from 'fs';
import * as path from 'path';
import config from '../../config.json';

const docsDir = path.resolve(config.documentsFolder);

export function readDocument(filename: string): string {
  // Sanitize: strip directory traversal attempts
  const safeName = path.basename(filename);
  const filePath = path.join(docsDir, safeName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Document not found: ${safeName}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

export function listDocuments(): string[] {
  if (!fs.existsSync(docsDir)) return [];
  return fs.readdirSync(docsDir).filter(f => f.endsWith('.txt'));
}
