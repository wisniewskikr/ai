'use strict';

/*
 * agent.js — agent orchestration for the in-cache memory demo.
 *
 * How prompt caching works here:
 *   1. A large fictional profile document (chris_profile.txt) is loaded and
 *      attached to every API call as a system prompt with cache_control.
 *   2. Anthropic caches the prompt server-side after the first call.
 *   3. Subsequent calls within the cache TTL (~5 min) skip re-processing the
 *      document, which is reflected in cache_read_input_tokens > 0.
 *
 * Cache clearing:
 *   clearCache() increments a version stored in cache_state.json.
 *   That version is appended to the document, changing its content and
 *   therefore its cache key — the next call will be a cache miss again.
 */

const fs                 = require('fs');
const path               = require('path');
const { chatWithCache }  = require('../lib/api');
const logger             = require('../lib/logger');

const PROFILE_PATH       = path.join(__dirname, '../prompts/chris_profile.txt');
const CACHE_STATE_PATH   = path.join(process.cwd(), 'cache_state.json');

// --------------------------------------------------------------------------
// Cache version helpers
// --------------------------------------------------------------------------

function getCacheVersion() {
    try {
        if (fs.existsSync(CACHE_STATE_PATH)) {
            const data = JSON.parse(fs.readFileSync(CACHE_STATE_PATH, 'utf8'));
            return data.version ?? 0;
        }
    } catch (_) { /* treat missing/corrupt file as version 0 */ }
    return 0;
}

function clearCache() {
    const current = getCacheVersion();
    const next    = current + 1;
    fs.writeFileSync(CACHE_STATE_PATH, JSON.stringify({ version: next }, null, 2));
    logger.info(`[Cache] Version updated: ${current} → ${next}`);
    logger.info('[Cache] The next API call will be a cache miss.');
}

// --------------------------------------------------------------------------
// System prompt builder
// --------------------------------------------------------------------------

function buildSystemPrompt() {
    const base    = fs.readFileSync(PROFILE_PATH, 'utf8').trim();
    const version = getCacheVersion();
    // Appending the version makes the cache key unique per version,
    // so clearing the cache forces a fresh cache_creation on the next call.
    return `${base}\n\n<!-- cache_version: ${version} -->`;
}

// --------------------------------------------------------------------------
// Run one turn
// --------------------------------------------------------------------------

/**
 * Send a single user message using the cached profile as system prompt.
 *
 * @param {object} config      - Config from loadConfig()
 * @param {string} userMessage - The user's question / instruction
 * @returns {Promise<{answer: string, usage: object}>}
 */
async function run(config, userMessage) {
    const systemPrompt = buildSystemPrompt();
    logger.info(`[Agent] User: "${userMessage}"`);
    logger.info(`[Agent] System prompt: ${systemPrompt.length} chars | cache_version: ${getCacheVersion()} | model: ${config.model}`);

    const result = await chatWithCache(config, systemPrompt, userMessage);

    logger.result(`[Agent] Assistant: "${result.answer}"`);
    return result;
}

module.exports = { run, clearCache };
