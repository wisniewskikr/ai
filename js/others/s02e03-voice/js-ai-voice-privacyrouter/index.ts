import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import config from './config.json';
import { initLogger, log } from './src/utils/logger';
import { scanAudioFiles } from './src/utils/audioScanner';
import { transcribe } from './src/services/transcriber';
import { classify, ClassificationResult } from './src/services/classifier';

dotenv.config();

interface FileReport {
  filename: string;
  transcript: string;
  topic: string;
  sensitivity: string;
  decision: string;
  reason: string;
  error?: string;
}

function printTable(reports: FileReport[]): void {
  const col = { file: 32, topic: 22, sensitivity: 12, decision: 8 };
  const header =
    'File'.padEnd(col.file) +
    'Topic'.padEnd(col.topic) +
    'Sensitivity'.padEnd(col.sensitivity) +
    'Decision';
  const divider = '-'.repeat(header.length + 2);

  console.log('\n' + header);
  console.log(divider);

  for (const r of reports) {
    const decision = r.decision.toUpperCase();
    const line =
      r.filename.substring(0, col.file - 1).padEnd(col.file) +
      r.topic.substring(0, col.topic - 1).padEnd(col.topic) +
      r.sensitivity.padEnd(col.sensitivity) +
      decision;
    console.log(line);
  }

  console.log('');
}

async function processFile(audioPath: string): Promise<FileReport> {
  const filename = path.basename(audioPath);

  log.info(`Transcribing: ${filename}`);
  const transcript = await transcribe(audioPath, config.whisper.model);
  log.info(`Transcript (${filename}): ${transcript.substring(0, 100)}...`);

  log.info(`Classifying: ${filename}`);
  const result: ClassificationResult = await classify(
    transcript,
    config.llm.baseUrl,
    config.llm.model,
    config.llm.temperature,
    config.llm.maxTokens,
  );

  log.info(
    `Result (${filename}): ${result.decision.toUpperCase()} — ${result.topic} [${result.sensitivity}]`,
  );

  return {
    filename,
    transcript,
    topic: result.topic,
    sensitivity: result.sensitivity,
    decision: result.decision,
    reason: result.reason,
  };
}

async function main(): Promise<void> {
  initLogger(config.paths.logs);
  log.info('Privacy Router started');

  const workspaceDir = path.resolve(config.paths.workspace);
  const audioFiles = scanAudioFiles(workspaceDir, config.supportedAudioExtensions);

  if (audioFiles.length === 0) {
    log.warn(`No audio files found in ${workspaceDir}`);
    console.log(`No audio files found in workspace/. Add .mp3, .wav, .m4a, .ogg, or .flac files.`);
    return;
  }

  console.log(`\nAnalyzing ${audioFiles.length} file(s) from workspace/\n`);
  log.info(`Found ${audioFiles.length} audio file(s)`);

  const reports: FileReport[] = [];

  for (const audioPath of audioFiles) {
    try {
      const report = await processFile(audioPath);
      reports.push(report);
    } catch (err) {
      const filename = path.basename(audioPath);
      const message = err instanceof Error ? err.message : String(err);
      log.error(`Failed to process ${filename}: ${message}`);
      reports.push({
        filename,
        transcript: '',
        topic: 'error',
        sensitivity: 'unknown',
        decision: 'local', // safe default on error
        reason: message,
        error: message,
      });
    }
  }

  printTable(reports);

  // Save routing report
  const resultsDir = path.resolve(config.paths.results);
  fs.mkdirSync(resultsDir, { recursive: true });

  const reportPath = path.join(resultsDir, 'routing-report.json');
  const reportData = {
    generatedAt: new Date().toISOString(),
    files: reports,
  };
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  log.info(`Routing report saved to ${reportPath}`);
  console.log(`Privacy routing complete. Report: results/routing-report.json`);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  log.error(`Fatal error: ${message}`);
  process.exit(1);
});
