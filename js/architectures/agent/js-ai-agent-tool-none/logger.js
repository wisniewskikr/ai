/*
 * logger.js — synchronous, two-target logger (console + daily log file)
 *
 * Intentionally synchronous: logging must not silently drop messages if the
 * process crashes mid-run.  For a Hello World agent the throughput is trivial;
 * don't add async complexity where it buys nothing.
 */

import { mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const LOG_DIR = 'logs';

/* Create the directory once at module load — idempotent, safe to repeat. */
mkdirSync(LOG_DIR, { recursive: true });

/* ANSI escape codes — only used on console output, never written to files. */
const RESET  = '\x1b[0m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';

function now() {
    return new Date().toISOString();
}

function today() {
    return now().split('T')[0];   /* "2026-04-02" */
}

/*
 * write() is the single choke-point for all output.
 *
 * Format on disk: [2026-04-02T10:00:00.000Z] [STEP  ] Message text
 * The level field is padded to 6 chars so columns align in log viewers.
 */
function write(level, color, message) {
    const line = `[${now()}] [${level.padEnd(6)}] ${message}`;

    /* Console gets colour; files stay plain so grep works without --color. */
    console.log(color + line + RESET);
    appendFileSync(join(LOG_DIR, `${today()}.log`), line + '\n');
}

export const log = {
    info:   (msg) => write('INFO',   RESET,  msg),
    step:   (msg) => write('STEP',   CYAN,   msg),
    result: (msg) => write('RESULT', GREEN,  msg),
    warn:   (msg) => write('WARN',   YELLOW, msg),
    error:  (msg) => write('ERROR',  RED,    msg),
};
