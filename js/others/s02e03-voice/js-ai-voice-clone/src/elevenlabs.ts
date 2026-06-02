import fs from 'fs'
import path from 'path'
import { logger } from './logger'
import config from '../config.json'

const API_BASE = 'https://api.elevenlabs.io/v1'

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('ELEVENLABS_API_KEY not set in .env')
  return key
}

export async function listVoices(): Promise<{ voice_id: string; name: string }[]> {
  const apiKey = getApiKey()
  const response = await fetch(`${API_BASE}/voices`, {
    headers: { 'xi-api-key': apiKey },
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to list voices: ${response.status} ${err}`)
  }
  const data = (await response.json()) as { voices: { voice_id: string; name: string }[] }
  return data.voices
}

export async function cloneVoice(audioPath: string): Promise<string> {
  const apiKey = getApiKey()
  const voiceName = `clone_${Date.now()}`

  const fileBuffer = fs.readFileSync(audioPath)
  const blob = new Blob([fileBuffer])
  const form = new FormData()
  form.append('name', voiceName)
  form.append('files', blob, path.basename(audioPath))

  const response = await fetch(`${API_BASE}/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to clone voice: ${response.status} ${err}`)
  }

  const data = (await response.json()) as { voice_id: string }
  return data.voice_id
}

export async function synthesizeSpeech(voiceId: string, text: string): Promise<Buffer> {
  const apiKey = getApiKey()

  const response = await fetch(
    `${API_BASE}/text-to-speech/${voiceId}?output_format=${config.output_format}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: config.model_id,
        voice_settings: {
          stability: config.stability,
          similarity_boost: config.similarity_boost,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to synthesize speech: ${response.status} ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function deleteVoice(voiceId: string): Promise<void> {
  const apiKey = getApiKey()

  const response = await fetch(`${API_BASE}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': apiKey },
  })

  if (!response.ok) {
    const err = await response.text()
    logger.warn(`Failed to delete voice ${voiceId}: ${response.status} ${err}`)
  }
}
