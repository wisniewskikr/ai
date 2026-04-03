/**
 * logger.js
 *
 * Two-output logger: colorized console for humans, plain text for files.
 * Logs go to logs/YYYY-MM-DD.log — one file per day, appended, never truncated.
 *
 * Call order matters: import logger before anything else that might log.
 */

import { mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const LOG_DIR = 'logs';
mkdirSync(LOG_DIR, { recursive: true });

const LOG_FILE = join(LOG_DIR, new Date().toISOString().slice(0, 10) + '.log');

// ANSI codes — no external deps needed for this
const C = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    cyan:    '\x1b[36m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    magenta: '\x1b[35m',
    white:   '\x1b[37m',
};

function now() {
    return new Date().toISOString();
}

function toFile(level, message) {
    // Strip ANSI codes — file readers don't want escape sequences
    const plain = message.replace(/\x1b\[[0-9;]*m/g, '');
    appendFileSync(LOG_FILE, `[${now()}] [${level.padEnd(6)}] ${plain}\n`);
}

export const logger = {
    /**
     * General informational message — what's happening and why.
     */
    info(message) {
        console.log(`${C.cyan}[INFO]${C.reset}  ${C.dim}${now()}${C.reset}  ${message}`);
        toFile('INFO', message);
    },

    /**
     * A discrete phase or milestone in the agent's execution.
     */
    step(message) {
        console.log(`\n${C.green}[STEP]${C.reset}  ${C.dim}${now()}${C.reset}  ${C.bold}${message}${C.reset}`);
        toFile('STEP', message);
    },

    /**
     * A native tool was called or returned a value.
     */
    tool(message) {
        console.log(`${C.magenta}[TOOL]${C.reset}  ${C.dim}${now()}${C.reset}  ${message}`);
        toFile('TOOL', message);
    },

    /**
     * Final value produced by a phase — what the model ultimately returned.
     */
    result(message) {
        console.log(`${C.yellow}[RESULT]${C.reset} ${C.dim}${now()}${C.reset}  ${C.bold}${message}${C.reset}`);
        toFile('RESULT', message);
    },

    /**
     * Something went wrong. Always goes to stderr as well.
     */
    error(message) {
        console.error(`${C.red}[ERROR]${C.reset}  ${C.dim}${now()}${C.reset}  ${message}`);
        toFile('ERROR', message);
    },
};
