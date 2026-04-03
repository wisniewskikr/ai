'use strict';

/*
 * main.js — entry point
 *
 * Wires together config loading, logging, and the orchestrator pipeline.
 * Any unrecoverable error prints a clear message and exits with a non-zero code.
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const orchestrator   = require('./src/agents/orchestrator');

async function main() {
    logger.info('========================================');
    logger.info(' Multi-Agent Hello World — Native Tools ');
    logger.info('========================================');
    logger.info(`Log file: ${logger.logFile}`);

    /* Load and validate configuration */
    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration error: ${err.message}`);
        process.exit(1);
    }

    logger.info(`Config loaded — model: ${config.model} | input: "${config.input}"`);

    /* Run the orchestrator pipeline */
    let results;
    try {
        results = await orchestrator.run(config);
    } catch (err) {
        logger.error(`Pipeline failed: ${err.message}`);
        logger.debug(err.stack);
        process.exit(1);
    }

    /* Print the final results */
    logger.info('========================================');
    logger.info(`  Result (no tool):   ${results.noTool}`);
    logger.info(`  Result (with tool): ${results.withTool}`);
    logger.info('========================================');
}

main();
