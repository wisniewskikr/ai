'use strict';

/*
 * main.js — entry point. Bootstrap and run.
 *
 * Demonstrates in-weights memory: the model only knows what was baked in
 * during training, so it cannot retrieve personal user data (e.g. a name).
 *
 * Usage:
 *   node main.js
 *   node main.js "What is my name?"
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const agent          = require('./src/agents/agent');

async function main() {
    logger.info('========================================');
    logger.info('     Agent — In-Weights Memory Demo     ');
    logger.info('========================================');

    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration error: ${err.message}`);
        process.exit(1);
    }

    const prompt = process.argv[2] || config.input;
    logger.info(`Config loaded — model: ${config.model} | input: "${prompt}"`);

    let result;
    try {
        result = await agent.run(config, prompt);
    } catch (err) {
        logger.error(`Agent crashed: ${err.message}`);
        process.exit(1);
    }

    logger.info('========================================');
    logger.info(`  Result: ${result}`);
    logger.info('========================================');
}

main();
