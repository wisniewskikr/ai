import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for console output
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  red:     '\x1b[31m',
};

const LEVEL_STYLES = {
  INFO:   { color: C.cyan,    icon: 'ℹ', label: 'INFO  ' },
  STEP:   { color: C.magenta, icon: '▶', label: 'STEP  ' },
  RESULT: { color: C.green,   icon: '✔', label: 'RESULT' },
  ERROR:  { color: C.red,     icon: '✖', label: 'ERROR ' },
  TOOL:   { color: C.yellow,  icon: '⚙', label: 'TOOL  ' },
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logFile = path.join(logsDir, `run-${runTimestamp}.log`);

function writeToFile(text) {
  fs.appendFileSync(logFile, text + '\n', 'utf-8');
}

function log(level, message) {
  const ts = new Date().toISOString();
  const style = LEVEL_STYLES[level];
  console.log(`${C.dim}[${ts}]${C.reset} ${style.color}${C.bold}${style.icon} ${style.label}${C.reset}  ${message}`);
  writeToFile(`[${ts}] [${style.label}] ${message}`);
}

function separator(title = '') {
  const line = '─'.repeat(60);
  if (title) {
    const padded = `─── ${title} `;
    const full = padded + '─'.repeat(Math.max(0, 60 - padded.length));
    console.log(`\n${C.bold}${C.blue}${full}${C.reset}`);
    writeToFile(`\n${full}`);
  } else {
    console.log(`${C.dim}${line}${C.reset}`);
    writeToFile(line);
  }
}

export default {
  info:      (msg) => log('INFO',   msg),
  step:      (msg) => log('STEP',   msg),
  result:    (msg) => log('RESULT', msg),
  error:     (msg) => log('ERROR',  msg),
  tool:      (msg) => log('TOOL',   msg),
  separator,
  logFile,
};
