'use strict';

/*
 * api.js — thin wrapper around the OpenRouter chat completions endpoint.
 *
 * Two exported functions:
 *   chatCompletion          — plain text reply, no tool support
 *   chatCompletionWithTools — returns full choice data so the caller can
 *                             inspect finish_reason and handle tool_calls
 *
 * Uses native fetch (Node 18+). No retries, no caching.
 */

/**
 * Send a chat completion request and return the assistant's reply text.
 * Convenience wrapper for agents that don't use tools.
 *
 * @param {object} config   - Config from loadConfig()
 * @param {Array}  messages - OpenAI-style [{role, content}] array
 * @returns {Promise<string>}
 */
async function chatCompletion(config, messages) {
    const result = await chatCompletionWithTools(config, messages, []);
    return result.content;
}

/**
 * Send a chat completion request, optionally with tool definitions.
 * Returns the raw choice data so the caller can drive the tool-use loop.
 *
 * @param {object} config   - Config from loadConfig()
 * @param {Array}  messages - OpenAI-style [{role, content}] array
 * @param {Array}  tools    - OpenAI-style tool definition array (may be empty)
 * @returns {Promise<{content: string, finish_reason: string, tool_calls: Array}>}
 */
async function chatCompletionWithTools(config, messages, tools) {
    const { apiKey, model, baseUrl, maxTokens, temperature } = config;
    const url = `${baseUrl}/chat/completions`;

    const body = {
        model,
        messages,
        max_tokens:  maxTokens,
        temperature,
    };

    /* Only attach tool definitions when there are actually tools to offer.
     * Sending an empty tools array to some models triggers unnecessary warnings. */
    if (tools && tools.length > 0) {
        body.tools       = tools;
        body.tool_choice = 'auto';
    }

    const response = await fetch(url, {
        method:  'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error ${response.status}: ${text}`);
    }

    const data   = await response.json();
    const choice = data.choices[0];

    return {
        content:       choice.message.content || '',
        finish_reason: choice.finish_reason,
        tool_calls:    choice.message.tool_calls || [],
    };
}

module.exports = { chatCompletion, chatCompletionWithTools };
