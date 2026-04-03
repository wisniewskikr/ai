'use strict';

/*
 * api.js — Anthropic SDK wrapper with prompt caching support.
 *
 * Exported function:
 *   chatWithCache — sends a message with the system prompt marked for caching.
 *                   Returns answer text + full usage (including cache stats).
 *
 * The system prompt is passed with cache_control: { type: "ephemeral" } so
 * Anthropic will cache it server-side.  On the first call the response contains
 * cache_creation_input_tokens > 0 (cache MISS — document written to cache).
 * On subsequent calls within the TTL (~5 min) cache_read_input_tokens > 0
 * (cache HIT — document read from cache, faster and cheaper).
 */

const Anthropic = require('@anthropic-ai/sdk');

/**
 * Send a user message with a cached system prompt.
 *
 * @param {object} config       - Config from loadConfig()
 * @param {string} systemPrompt - Large document to cache server-side
 * @param {string} userMessage  - The user's question / instruction
 * @returns {Promise<{answer: string, usage: object}>}
 */
async function chatWithCache(config, systemPrompt, userMessage) {
    const client = new Anthropic({ apiKey: config.apiKey });

    const response = await client.messages.create({
        model:      config.model,
        max_tokens: config.maxTokens,
        system: [
            {
                type:          'text',
                text:          systemPrompt,
                cache_control: { type: 'ephemeral' },
            },
        ],
        messages: [
            { role: 'user', content: userMessage },
        ],
    });

    const answer = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

    return { answer, usage: response.usage };
}

module.exports = { chatWithCache };
