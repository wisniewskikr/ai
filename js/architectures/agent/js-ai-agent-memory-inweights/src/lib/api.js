'use strict';

/*
 * api.js — thin wrapper around the OpenRouter chat completions endpoint.
 *
 * Uses native fetch (Node 18+). No retries, no caching.
 */

/**
 * Send a chat completion request and return the assistant's reply text.
 *
 * @param {object} config   - Config from loadConfig()
 * @param {Array}  messages - OpenAI-style [{role, content}] array
 * @returns {Promise<string>}
 */
async function chatCompletion(config, messages) {
    const { apiKey, model, baseUrl, maxTokens, temperature } = config;
    const url = `${baseUrl}/chat/completions`;

    const response = await fetch(url, {
        method:  'POST',
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
        const text = await response.text();
        throw new Error(`API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || '';
}

module.exports = { chatCompletion };
