import { spawn } from 'child_process';
import * as path from 'path';

export function transcribe(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'src', 'whisper_transcribe.py');
    const model = process.env.WHISPER_MODEL ?? 'base';

    const proc = spawn('python', [scriptPath, model, audioPath]);

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Whisper failed (exit ${code}): ${errorOutput}`));
      } else {
        resolve(output.trim());
      }
    });
  });
}
