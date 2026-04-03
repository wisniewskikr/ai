'use strict';

/*
 * main.js — entry point. Bootstrap and run.
 *
 * Demonstrates in-context memory: conversation history is preserved across
 * multiple turns so the model can recall information from earlier messages.
 *
 * Usage:
 *   npm start
 *   node main.js "My name is Alice" "What is my name?"
 */

const { loadConfig } = require('./src/lib/config');
const logger         = require('./src/lib/logger');
const agent          = require('./src/agents/agent');

async function main() {
    logger.info('========================================');
    logger.info('   Agent — In-Context Memory Demo      ');
    logger.info('========================================');

    let config;
    try {
        config = loadConfig();
    } catch (err) {
        logger.error(`Configuration error: ${err.message}`);
        process.exit(1);
    }

    // Accept inputs from CLI args or fall back to config.inputs / config.input
    const inputs = process.argv.length > 2
        ? process.argv.slice(2)
        : (Array.isArray(config.inputs) ? config.inputs : [config.input]);

    logger.info(`Config loaded — model: ${config.model} | turns: ${inputs.length}`);

    let history = [];

    for (let i = 0; i < inputs.length; i++) {
        logger.step(`Turn ${i + 1} / ${inputs.length}`);
        try {
            const { answer, history: next } = await agent.run(config, inputs[i], history);
            history = next;
            logger.info('----------------------------------------');
            logger.info(`  Result [turn ${i + 1}]: ${answer}`);
            logger.info('----------------------------------------');
        } catch (err) {
            logger.error(`Agent crashed on turn ${i + 1}: ${err.message}`);
            process.exit(1);
        }
    }

    logger.info('========================================');
    logger.info('  Done.');
    logger.info('========================================');
}

main();
