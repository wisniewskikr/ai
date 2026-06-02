import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { logger } from './logger'
import { synthesizeSpeech } from './elevenlabs'
import config from '../config.json'

const RESULTS_DIR = path.join(process.cwd(), 'results')

function ensureDirectories() {
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true })
}

function promptText(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question('\nEnter text to synthesize with your voice:\n> ', answer => {
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

async function main() {
  ensureDirectories()
  logger.info('=== Voice Synthesis Demo ===')

  const text = await promptText()
  if (!text) {
    logger.error('No text provided. Exiting.')
    process.exit(1)
  }

  const startTime = Date.now()

  const voiceId = config.voice_id
  logger.info(`Using preset voice ID: ${voiceId}`)

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
