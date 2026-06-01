import 'dotenv/config';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config.json';
import { downloadAndTrim } from './services/youtube';
import { transcribe } from './services/stt';
import { log } from './utils/logger';

function askUrl(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('Podaj URL YouTube: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const url = await askUrl();

  if (!url) {
    log('ERROR', 'Nie podano URL');
    process.exit(1);
  }

  log('INFO', `Pobieram audio: ${url}`);
  const audioPath = await downloadAndTrim(url);
  log('INFO', `Audio gotowe (${config.audioDurationSeconds}s): ${audioPath}`);

  log('INFO', 'Transkrybuję...');
  const text = await transcribe(audioPath);

  const workspaceDir = path.resolve(config.workspaceDir);
  fs.mkdirSync(workspaceDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(workspaceDir, `${timestamp}.txt`);
  fs.writeFileSync(outputPath, text, 'utf-8');

  log('INFO', `Transkrypcja zapisana: ${outputPath}`);
  console.log(`\n${text}`);
}

main().catch((err) => {
  log('ERROR', (err as Error).message);
  process.exit(1);
});
