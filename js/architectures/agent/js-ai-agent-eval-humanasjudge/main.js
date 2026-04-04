'use strict';

/*
 * main.js — entry point.
 *
 * Bootstrap only: load configuration and start the orchestrator.
 * All agent logic lives in src/agents/.
 *
 * Usage:
 *   node main.js
 */

const { loadConfig }     = require('./src/libs/config');
const logger             = require('./src/libs/logger');
const orchestrator       = require('./src/agents/orchestrator');

/* ------------------------------------------------------------------ */

async function main() {
    logger.banner('AI Agent — Human-as-Judge Evaluation');

    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration: ${err.message}`);
        process.exit(1);
    }

    logger.info(`Model    : ${config.model}`);
    logger.info(`Max tokens: ${config.maxTokens}`);
    logger.separator();

    try {
        await orchestrator.run(config);
    } catch (err) {
        logger.error(`${err.message}`);
        process.exit(1);
    }
}

/* ------------------------------------------------------------------ */

main().catch((err) => {
    logger.error(`Unhandled error: ${err.message}`);
    process.exit(1);
});
