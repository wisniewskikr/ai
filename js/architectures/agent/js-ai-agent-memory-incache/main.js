'use strict';

/*
 * main.js — entry point. Bootstrap and run the in-cache memory demo.
 *
 * What this demo shows:
 *   A large fictional profile document is sent as the system prompt with
 *   Anthropic's cache_control flag.  The same question is asked twice:
 *     Call 1  →  cache MISS  — document is processed and written to cache
 *                              (cache_creation_input_tokens > 0)
 *     Call 2  →  cache HIT   — document is read from cache, skipping processing
 *                              (cache_read_input_tokens > 0, faster & cheaper)
 *
 * The assistant's answer contains the name "Chris" extracted from the profile.
 *
 * Usage:
 *   npm start                  — run the two-call demo
 *   node main.js --clear-cache — invalidate the cache (force next miss)
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const agent          = require('./src/agents/agent');

// --------------------------------------------------------------------------
// Cache stats printer
// --------------------------------------------------------------------------

function printCacheStats(label, usage) {
    const created = usage.cache_creation_input_tokens ?? 0;
    const read    = usage.cache_read_input_tokens     ?? 0;

    logger.info(`[${label}] Token usage:`);
    logger.info(`  input_tokens                 : ${usage.input_tokens}`);
    logger.info(`  cache_creation_input_tokens  : ${created}`);
    logger.info(`  cache_read_input_tokens      : ${read}`);
    logger.info(`  output_tokens                : ${usage.output_tokens}`);

    if (created > 0 && read === 0) {
        logger.warn(`  => CACHE MISS — document written to cache (${created} tokens processed)`);
    } else if (read > 0) {
        logger.result(`  => CACHE HIT  — document read from cache (${read} tokens saved!) — faster & cheaper`);
    } else {
        logger.warn('  => CACHE STATUS unknown (neither creation nor read tokens reported)');
    }
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------

async function main() {
    logger.info('========================================');
    logger.info('   Agent — In-Cache Memory Demo        ');
    logger.info('========================================');

    // Handle --clear-cache before loading config (no API call needed)
    if (process.argv.includes('--clear-cache')) {
        logger.step('Clearing cache...');
        agent.clearCache();
        logger.info('========================================');
        logger.info('  Done. Run "npm start" to test again.');
        logger.info('========================================');
        return;
    }

    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration error: ${err.message}`);
        process.exit(1);
    }

    logger.info(`Config loaded — model: ${config.model}`);

    const question = 'Display the text "Hello World" followed by my name from the profile document.';

    // ---- Call 1 — expected CACHE MISS ----
    logger.step('Call 1 — expected: CACHE MISS (document will be written to cache)');
    let result1;
    try {
        result1 = await agent.run(config, question);
    } catch (err) {
        logger.error(`Call 1 failed: ${err.message}`);
        process.exit(1);
    }
    logger.info('----------------------------------------');
    logger.info(`  Answer [call 1]: ${result1.answer}`);
    printCacheStats('Call 1', result1.usage);
    logger.info('----------------------------------------');

    // ---- Call 2 — expected CACHE HIT ----
    logger.step('Call 2 — expected: CACHE HIT (document will be read from cache)');
    let result2;
    try {
        result2 = await agent.run(config, question);
    } catch (err) {
        logger.error(`Call 2 failed: ${err.message}`);
        process.exit(1);
    }
    logger.info('----------------------------------------');
    logger.info(`  Answer [call 2]: ${result2.answer}`);
    printCacheStats('Call 2', result2.usage);
    logger.info('----------------------------------------');

    logger.info('========================================');
    logger.info('  Done.');
    logger.info('  Tip: run "node main.js --clear-cache" to invalidate the cache.');
    logger.info('========================================');
}

main();
