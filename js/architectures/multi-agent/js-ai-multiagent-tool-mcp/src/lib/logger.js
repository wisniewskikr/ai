'use strict';

/*
 * logger.js — timestamp-prefixed console + file logger.
 *
 * One file per run, named by timestamp so nothing ever gets overwritten.
 * Colors in the terminal, plain text on disk — log parsers don't like ANSI.
 */

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const runTimestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
const LOG_FILE     = path.join(LOG_DIR, `run-${runTimestamp}.log`);

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
