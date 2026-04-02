/*
 * index.js — entry point
 *
 * Wires together: config, environment, agent, logger.
 * Does not contain business logic — that belongs in agent.js.
 */

import { readFileSync } from 'fs';
import { config }       from 'dotenv';
import { log }          from './logger.js';
import { runAgent }     from './agent.js';

/* Load .env before anything reads process.env. */
config();

/*
 * loadConfig — read and parse config.json.
 * Exits the process on failure — there is no sensible recovery path if the
 * config file is missing or malformed.
 */
function loadConfig(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (err) {
        log.error(`Cannot load ${path}: ${err.message}`);
        process.exit(1);
    }
}

async function main() {
    log.info('=== Agent started ===');

    /* --- Configuration -------------------------------------------------- */
    const cfg    = loadConfig('config.json');
    const model  = cfg.model;
    const apiKey = process.env.OPENROUTER_API_KEY;

    /* CLI argument overrides the value from config.json. */
    const prompt = process.argv[2] ?? cfg.prompt;

    if (!apiKey) {
        log.error('OPENROUTER_API_KEY is not set — add it to your .env file');
        process.exit(1);
    }

    /* --- Pre-flight logging --------------------------------------------- */
    log.info(`Model  : ${model}`);
    log.info(`Prompt : "${prompt}"`);

    /* --- Agent call -------------------------------------------------------- */
    log.step('Sending prompt to model...');

    let result;
    try {
        result = await runAgent({ prompt, model, apiKey });
    } catch (err) {
        log.error(`Agent call failed: ${err.message}`);
        process.exit(1);
    }

    /* --- Results ----------------------------------------------------------- */
    log.step('Response received');
    log.info(
        `Tokens : ${result.usage.total_tokens} ` +
        `(prompt=${result.usage.prompt_tokens}, ` +
        `completion=${result.usage.completion_tokens})`
    );
    log.result(`Output : ${result.output}`);

    log.info('=== Agent finished ===');
}

main();
