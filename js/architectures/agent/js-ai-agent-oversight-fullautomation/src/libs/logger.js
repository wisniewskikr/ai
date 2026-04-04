'use strict';

/*
 * logger.js — colorized console output + daily rotating log files.
 *
 * Log levels:
 *   info   — general status messages
 *   step   — major phase transitions (orchestrator / agent steps)
 *   tool   — tool call details
 *   result — final output values
 *   warn   — non-fatal oddities
 *   error  — failures
 *
 * Console lines are colorized.  File lines are plain ASCII so they stay
 * readable in any editor without ANSI noise.
 *
 * One log file per calendar day: logs/YYYY-MM-DD.log
 */

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

/* ANSI escape codes */
const C = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    green:   '\x1b[32m',
    cyan:    '\x1b[36m',
    magenta: '\x1b[35m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    white:   '\x1b[97m',
};

/* Per-level console label (padded to 6 chars for alignment) */
const LABEL = {
    INFO:   `${C.green}INFO  ${C.reset}`,
    STEP:   `${C.cyan}${C.bold}STEP  ${C.reset}`,
    TOOL:   `${C.magenta}TOOL  ${C.reset}`,
    RESULT: `${C.white}${C.bold}RESULT${C.reset}`,
    WARN:   `${C.yellow}WARN  ${C.reset}`,
    ERROR:  `${C.red}${C.bold}ERROR ${C.reset}`,
};

/* ------------------------------------------------------------------ */

function pad2(n) { return String(n).padStart(2, '0'); }

function timestamp() {
    const d = new Date();
    return (
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
        ` ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
    );
}

function logFilePath() {
    const d = new Date();
    const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    return path.join(LOG_DIR, `${date}.log`);
}

function stripAnsi(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }

function write(level, msg) {
    const ts = timestamp();
    console.log(`[${ts}] [${LABEL[level]}] ${msg}`);
    fs.appendFileSync(logFilePath(), `[${ts}] [${level.padEnd(6)}] ${stripAnsi(msg)}\n`);
}

/* ------------------------------------------------------------------ */

function banner(title) {
    const rule      = '═'.repeat(56);
    const pad       = Math.max(0, Math.floor((54 - title.length) / 2));
    const centered  = ' '.repeat(pad) + title;
    const ts        = timestamp();

    console.log(`\n${C.bold}${C.cyan}╔${rule}╗${C.reset}`);
    console.log(`${C.bold}${C.cyan}║  ${centered.padEnd(54)}║${C.reset}`);
    console.log(`${C.bold}${C.cyan}╚${rule}╝${C.reset}\n`);

    const plain = `\n${'='.repeat(58)}\n  ${title}\n${'='.repeat(58)}\n`;
    fs.appendFileSync(logFilePath(), `[${ts}] ${plain}`);
}

function separator() {
    const line = '─'.repeat(56);
    console.log(`${C.dim}${line}${C.reset}`);
    fs.appendFileSync(logFilePath(), `${'-'.repeat(56)}\n`);
}

/* ------------------------------------------------------------------ */

module.exports = {
    info:      (msg) => write('INFO',   msg),
    step:      (msg) => write('STEP',   msg),
    tool:      (msg) => write('TOOL',   msg),
    result:    (msg) => write('RESULT', msg),
    warn:      (msg) => write('WARN',   msg),
    error:     (msg) => write('ERROR',  msg),
    banner,
    separator,
};
