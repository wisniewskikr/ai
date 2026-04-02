import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, 'logs');

const COLORS = {
  INFO:    '\x1b[36m',  // cyan
  SUCCESS: '\x1b[32m',  // green
  WARN:    '\x1b[33m',  // yellow
  ERROR:   '\x1b[31m',  // red
  STEP:    '\x1b[35m',  // magenta
  RESET:   '\x1b[0m',
  BOLD:    '\x1b[1m',
};

function createLogger() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logFilePath = path.join(LOGS_DIR, `workflow-${runTimestamp}.log`);
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  function write(level, message) {
    const timestamp = new Date().toISOString();
    const fileLine = `[${timestamp}] [${level.padEnd(7)}] ${message}\n`;
    logStream.write(fileLine);

    const color = COLORS[level] ?? COLORS.RESET;
    const consoleLine = `${color}[${timestamp}] [${level.padEnd(7)}]${COLORS.RESET} ${message}`;
    console.log(consoleLine);
  }

  return {
    info:    (msg) => write('INFO',    msg),
    step:    (msg) => write('STEP',    `${COLORS.BOLD}${msg}${COLORS.RESET}`),
    success: (msg) => write('SUCCESS', msg),
    warn:    (msg) => write('WARN',    msg),
    error:   (msg) => write('ERROR',   msg),
    divider: ()    => write('INFO',    '─'.repeat(55)),
    logFile: logFilePath,
  };
}

export { createLogger };
