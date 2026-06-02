import { log } from '../utils/logger';

// Polyfill AudioContext for Node.js (required by @xenova/transformers for audio loading)
async function ensureAudioContext() {
  if (typeof (globalThis as Record<string, unknown>).AudioContext === 'undefined') {
    const { AudioContext } = await import('node-web-audio-api');
    (globalThis as Record<string, unknown>).AudioContext = AudioContext;
  }
}

// Lazy-loaded pipeline — downloads the model on first use
let pipeline: ((...args: unknown[]) => Promise<unknown>) | null = null;

async function getWhisperPipeline(model: string) {
  if (!pipeline) {
    await ensureAudioContext();
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
  const result = (await pipe(audioPath)) as { text: string };
  return result.text.trim();
}
