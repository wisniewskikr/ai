'use strict';

/*
 * logger.js — dual-output logger (console + file)
 *
 * Console output uses ANSI color codes for readability.
 * File output is plain text — no escape sequences polluting log files.
 * Each run creates a new timestamped log file under logs/.
 */

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/* e.g. run-2026-04-03T12-00-00.log */
const runTimestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
const LOG_FILE     = path.join(LOG_DIR, `run-${runTimestamp}.log`);

/* ANSI color codes — console only, never written to file */
const COLOR = {
    INFO:  '\x1b[32m',  /* green  */
    WARN:  '\x1b[33m',  /* yellow */
    ERROR: '\x1b[31m',  /* red    */
    DEBUG: '\x1b[36m',  /* cyan   */
    RESET: '\x1b[0m',
};

function write(level, message) {
    const ts    = new Date().toISOString();
    const plain = `[${ts}] [${level.padEnd(5)}] ${message}`;

    fs.appendFileSync(LOG_FILE, plain + '\n');

    const colored = `[${ts}] [${COLOR[level]}${level.padEnd(5)}${COLOR.RESET}] ${message}`;
    console.log(colored);
}

module.exports = {
    info:    (msg) => write('INFO',  msg),
    warn:    (msg) => write('WARN',  msg),
    error:   (msg) => write('ERROR', msg),
    debug:   (msg) => write('DEBUG', msg),
    logFile: LOG_FILE,
};
