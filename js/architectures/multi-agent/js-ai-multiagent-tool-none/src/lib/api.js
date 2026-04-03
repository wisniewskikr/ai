'use strict';

/*
 * api.js — thin wrapper around the OpenRouter chat completions endpoint.
 *
 * OpenRouter exposes an OpenAI-compatible API, so the request shape is
 * standard: POST /chat/completions with {model, messages}.
 *
 * This module does exactly one thing: send a message array, get a reply.
 * No retries, no caching — keep it simple, let the caller decide policy.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * @param {string}   apiKey   - OpenRouter API key
 * @param {string}   model    - Model identifier (e.g. "openai/gpt-4o")
 * @param {Array}    messages - OpenAI-style message array [{role, content}]
 * @returns {Promise<string>} - The assistant's reply text
 */
async function chatCompletion(apiKey, model, messages) {
    const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({ model, messages }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

module.exports = { chatCompletion };
