'use strict';

/*
 * main.js — entry point. Bootstrap and run.
 *
 * Thin by design: load config, hand off to orchestrator, print results.
 * All business logic lives in src/agents/. All I/O lives in src/lib/.
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const orchestrator   = require('./src/agents/orchestrator');

async function main() {
    logger.info('========================================');
    logger.info('   Multi-Agent Hello World (MCP tools)  ');
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

    logger.info(`Config loaded — model: ${config.model} | input: "${config.input}"`);

    /* Run the multi-agent pipeline */
    let results;
    try {
        results = await orchestrator.run(config);
    } catch (err) {
        logger.error(`Pipeline failed: ${err.message}`);
        if (err.stack) logger.debug(err.stack);
        process.exit(1);
    }

    /* Print final results */
    logger.info('========================================');
    logger.info(`  Result (no tool):  ${results.noTool}`);
    logger.info(`  Result (MCP tool): ${results.mcpTool}`);
    logger.info('========================================');
}

main();
