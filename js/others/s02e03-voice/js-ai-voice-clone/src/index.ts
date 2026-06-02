import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { logger } from './logger'
import { synthesizeSpeech, listVoices } from './elevenlabs'
import config from '../config.json'

const RESULTS_DIR = path.join(process.cwd(), 'results')

function ensureDirectories() {
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true })
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function generateOutputPath(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '')
  return path.join(RESULTS_DIR, `output_${date}_${time}.mp3`)
}

async function selectVoice(voices: { voice_id: string; name: string }[]): Promise<string> {
  console.log('\nAvailable voices:')
  voices.forEach((v, i) => console.log(`  [${i + 1}] ${v.name}`))

  while (true) {
    const answer = await ask(`\nSelect voice (1-${voices.length}): `)
    const index = parseInt(answer) - 1
    if (index >= 0 && index < voices.length) {
      return voices[index].voice_id
    }
    console.log('Invalid choice. Try again.')
  }
}

async function main() {
  ensureDirectories()
  logger.info('=== Voice Synthesis Demo ===')

  logger.info('Fetching available voices...')
  const voices = await listVoices()

  const voiceId = await selectVoice(voices)

  const text = await ask('\nEnter text to synthesize:\n> ')
  if (!text) {
    logger.error('No text provided. Exiting.')
    process.exitCode = 1
    return
  }

  const startTime = Date.now()

  logger.info('Synthesizing speech...')
  const audioBuffer = await synthesizeSpeech(voiceId, text)

  const outputPath = generateOutputPath()
  fs.writeFileSync(outputPath, audioBuffer)
  logger.info(`Audio saved: ${outputPath}`)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const filename = path.basename(outputPath)

  console.log(`\nDone. File saved: results/${filename}`)
  console.log(`Elapsed: ${elapsed}s`)
}

main().catch(err => {
  logger.error(err.message)
  process.exitCode = 1
})
