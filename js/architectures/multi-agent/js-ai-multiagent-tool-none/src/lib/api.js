'use strict';

/*
 * api.js — thin wrapper around the OpenRouter chat completions endpoint.
 *
 * OpenRouter exposes an OpenAI-compatible API, so the request shape is
 * standard: POST /chat/completions with {model, messages, ...params}.
 *
 * This module does exactly one thing: send a message array, get a reply.
 * No retries, no caching — keep it simple, let the caller decide policy.
 */

/**
 * Send a chat completion request.
 *
 * @param {object} config              - Config object from loadConfig()
 * @param {string} config.apiKey       - OpenRouter API key
 * @param {string} config.model        - Model identifier (e.g. "openai/gpt-4o")
 * @param {string} config.baseUrl      - API base URL
 * @param {number} config.maxTokens    - Maximum tokens in the response
 * @param {number} config.temperature  - Sampling temperature (0 = deterministic)
 * @param {Array}  messages            - OpenAI-style message array [{role, content}]
 * @returns {Promise<string>}          - The assistant's reply text
 */
async function chatCompletion(config, messages) {
    const { apiKey, model, baseUrl, maxTokens, temperature } = config;
    const url = `${baseUrl}/chat/completions`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens:  maxTokens,
            temperature,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

module.exports = { chatCompletion };
