import ytDlp from 'yt-dlp-exec';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import config from '../../config.json';

if (config.ffmpegPath) {
  ffmpeg.setFfmpegPath(config.ffmpegPath);
}

function trimAudio(input: string, output: string, seconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setDuration(seconds)
      .output(output)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
}

export async function downloadAndTrim(url: string): Promise<string> {
  const tmpDir = os.tmpdir();
  const id = Date.now();
  const outputTemplate = path.join(tmpDir, `yt-${id}.%(ext)s`);

  const ytDlpOptions: Record<string, unknown> = {
    extractAudio: true,
    audioFormat: 'mp3',
    output: outputTemplate,
  };
  if (config.ffmpegPath) {
    ytDlpOptions.ffmpegLocation = path.dirname(config.ffmpegPath);
  }

  await ytDlp(url, ytDlpOptions as Parameters<typeof ytDlp>[1]);

  const files = fs.readdirSync(tmpDir).filter((f) => f.startsWith(`yt-${id}.`));
  if (files.length === 0) {
    throw new Error('Audio download failed — no file found in tmp');
  }

  const rawPath = path.join(tmpDir, files[0]);
  const trimmedPath = path.join(tmpDir, `yt-${id}-trimmed.mp3`);

  await trimAudio(rawPath, trimmedPath, config.audioDurationSeconds);
  fs.unlinkSync(rawPath);

  return trimmedPath;
}
