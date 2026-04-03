'use strict';

/*
 * logger.js — console and file logger.
 *
 * Writes colored output to the console and plain text to a daily log
 * file under logs/. No external logging libraries needed.
 *
 * Log levels:
 *   INFO   - general progress messages
 *   STEP   - marks the start of a major phase
 *   TOOL   - MCP tool call activity
 *   RESULT - final output values
 *   WARN   - something unexpected but non-fatal
 *   ERROR  - fatal or near-fatal problems
 */

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'logs');

fs.mkdirSync(LOG_DIR, { recursive: true });

const COLOR = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    green:   '\x1b[32m',
    cyan:    '\x1b[36m',
    magenta: '\x1b[35m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    white:   '\x1b[97m',
};

const LEVEL_STYLE = {
    INFO:   `${COLOR.green}INFO ${COLOR.reset}`,
    STEP:   `${COLOR.cyan}${COLOR.bold}STEP ${COLOR.reset}`,
    TOOL:   `${COLOR.magenta}TOOL ${COLOR.reset}`,
    RESULT: `${COLOR.bold}${COLOR.white}RES  ${COLOR.reset}`,
    WARN:   `${COLOR.yellow}WARN ${COLOR.reset}`,
    ERROR:  `${COLOR.red}${COLOR.bold}ERROR${COLOR.reset}`,
};

function pad(n) {
    return String(n).padStart(2, '0');
}

function timestamp() {
    const d = new Date();
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        ` ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}

function logFilePath() {
    const d    = new Date();
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return path.join(LOG_DIR, `${date}.log`);
}

function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function write(level, message) {
    const ts          = timestamp();
    const coloredLine = `[${ts}] [${LEVEL_STYLE[level]}] ${message}`;
    const plainLine   = `[${ts}] [${level.padEnd(5)}] ${stripAnsi(message)}\n`;

    console.log(coloredLine);
    fs.appendFileSync(logFilePath(), plainLine);
}

module.exports = {
    info:   (msg) => write('INFO',   msg),
    step:   (msg) => write('STEP',   msg),
    tool:   (msg) => write('TOOL',   msg),
    result: (msg) => write('RESULT', msg),
    warn:   (msg) => write('WARN',   msg),
    error:  (msg) => write('ERROR',  msg),
};
