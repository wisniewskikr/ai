'use strict';

/*
 * main.js — entry point for the external-memory agent demo.
 *
 * Usage:
 *   node main.js          — run with the default prompt from config.json
 *   node main.js "prompt" — run with a custom prompt
 *   npm run reset         — delete memory.txt to restart the demo
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const agent          = require('./src/agents/agent');

async function main() {
    logger.info('========================================');
    logger.info('    Agent Demo: External Memory         ');
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

    let greeting;
    try {
        greeting = await agent.run(config, prompt);
    } catch (err) {
        logger.error(`Agent crashed: ${err.message}`);
        process.exit(1);
    }

    logger.info('========================================');
    logger.info(`  ${greeting}`);
    logger.info('========================================');
}

main();
