'use strict';

/*
 * main.js — entry point. Bootstrap and run.
 *
 * Keep this file thin: load config, hand off to orchestrator, print result.
 * All business logic lives in src/agents/.
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const orchestrator   = require('./src/agents/orchestrator');

async function main() {
    logger.info('========================================');
    logger.info('       Multi-Agent Hello World          ');
    logger.info('========================================');
    logger.info(`Log file: ${logger.logFile}`);

    /* Load and validate all external configuration upfront */
    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration error: ${err.message}`);
        process.exit(1);
    }

    logger.info(`Config loaded — model: ${config.model} | prompt: "${config.prompt}"`);

    /* Run the multi-agent pipeline */
    let result;
    try {
        result = await orchestrator.run(config);
    } catch (err) {
        logger.error(`Pipeline failed: ${err.message}`);
        process.exit(1);
    }

    logger.info('========================================');
    logger.info(`  RESULT: ${result}`);
    logger.info('========================================');
}

main();
