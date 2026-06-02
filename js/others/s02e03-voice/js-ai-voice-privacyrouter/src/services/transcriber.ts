import { pathToFileURL } from 'url';
import { log } from '../utils/logger';

// Lazy-loaded pipeline — downloads the model on first use
let pipeline: ((...args: unknown[]) => Promise<unknown>) | null = null;

async function getWhisperPipeline(model: string) {
  if (!pipeline) {
    log.info(`Loading Whisper model: ${model} (first run downloads ~150 MB)`);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = (await createPipeline('automatic-speech-recognition', model)) as NonNullable<typeof pipeline>;
    log.info('Whisper model ready');
  }
  return pipeline!;
}

export async function transcribe(audioPath: string, model: string): Promise<string> {
  const pipe = await getWhisperPipeline(model);
  const fileUrl = pathToFileURL(audioPath).href;

  const result = (await pipe(fileUrl)) as { text: string };
  return result.text.trim();
}
