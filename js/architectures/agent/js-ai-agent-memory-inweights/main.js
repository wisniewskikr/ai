'use strict';

/*
 * main.js — entry point. Bootstrap and run.
 *
 * Thin by design: load config, hand off to agent, print results.
 * All business logic lives in src/agents/. All I/O lives in src/lib/.
 *
 * Usage:
 *   node main.js
 *   node main.js "your prompt here"
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const agent          = require('./src/agents/agent');

async function main() {
    logger.info('========================================');
    logger.info('       Agent Hello World (MCP)          ');
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

    let results;
    try {
        results = await agent.run(config, prompt);
    } catch (err) {
        logger.error(`Agent crashed: ${err.message}`);
        process.exit(1);
    }

    logger.info('========================================');
    logger.info(`  Result (no tool):  ${results.withoutTools}`);
    logger.info(`  Result (MCP tool): ${results.withMcpTools}`);
    logger.info('========================================');
}

main();
