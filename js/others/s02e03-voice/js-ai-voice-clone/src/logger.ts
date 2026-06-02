import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function write(level: string, message: string) {
  const entry = `[${timestamp()}] [${level}] ${message}`
  console.log(entry)
  ensureLogDir()
  const logFile = path.join(LOG_DIR, `app_${new Date().toISOString().slice(0, 10)}.log`)
  fs.appendFileSync(logFile, entry + '\n')
}

export const logger = {
  info: (msg: string) => write('INFO', msg),
  warn: (msg: string) => write('WARN', msg),
  error: (msg: string) => write('ERROR', msg),
}
