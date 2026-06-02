import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import readline from 'readline'
import { parseFile } from 'music-metadata'
import { logger } from './logger'
import { cloneVoice, synthesizeSpeech, deleteVoice } from './elevenlabs'
import config from '../config.json'

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace')
const RESULTS_DIR = path.join(process.cwd(), 'results')

function ensureDirectories() {
  ;[WORKSPACE_DIR, RESULTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })
}

function getAudioFilePath(): string {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    throw new Error('workspace/ directory not found. Create it and place your audio file inside.')
  }

  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => {
    const ext = path.extname(f).slice(1).toLowerCase()
    return config.supported_formats.includes(ext)
  })

  if (files.length === 0) {
    throw new Error(
      `No audio files found in workspace/. Supported formats: ${config.supported_formats.join(', ')}`
    )
  }

  if (files.length > 1) {
    logger.warn(`Multiple audio files found. Using: ${files[0]}`)
  }

  return path.join(WORKSPACE_DIR, files[0])
}

async function validateAudio(filePath: string): Promise<void> {
  const metadata = await parseFile(filePath)
  const duration = metadata.format.duration ?? 0

  logger.info(`Audio file: ${path.basename(filePath)}, duration: ${duration.toFixed(1)}s`)

  if (duration < config.min_audio_duration_sec) {
    throw new Error(
      `Audio too short: ${duration.toFixed(1)}s (minimum: ${config.min_audio_duration_sec}s)`
    )
  }
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
  logger.info('=== Voice Clone Demo ===')

  const audioPath = getAudioFilePath()

  logger.info('Validating audio file...')
  await validateAudio(audioPath)

  const text = await promptText()
  if (!text) {
    logger.error('No text provided. Exiting.')
    process.exit(1)
  }

  const startTime = Date.now()

  logger.info('Cloning voice via ElevenLabs...')
  const voiceId = await cloneVoice(audioPath)
  logger.info(`Voice cloned. ID: ${voiceId}`)

  logger.info('Synthesizing speech...')
  const audioBuffer = await synthesizeSpeech(voiceId, text)

  const outputPath = generateOutputPath()
  fs.writeFileSync(outputPath, audioBuffer)
  logger.info(`Audio saved: ${outputPath}`)

  logger.info('Cleaning up: deleting voice clone...')
  await deleteVoice(voiceId)
  logger.info('Voice clone deleted from ElevenLabs.')

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const filename = path.basename(outputPath)

  console.log(`\nDone. File saved: results/${filename}`)
  console.log('==========================================')
  console.log('WARNING')
  console.log(`   Your voice was cloned in ${elapsed} seconds`)
  console.log(`   Based on just ${config.min_audio_duration_sec}s of audio`)
  console.log('   Voice clone deleted from ElevenLabs [OK]')
  console.log('==========================================')
}

main().catch(err => {
  logger.error(err.message)
  process.exit(1)
})
