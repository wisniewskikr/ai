'use strict';

/*
 * api.js — OpenRouter chat completion wrapper
 *
 * Two entry points:
 *   chatCompletion          — plain text response, no tools
 *   chatCompletionWithTools — supports tool_calls; returns the full assistant message
 *                             so the caller can inspect and execute tool_calls if present
 */

async function chatCompletion(config, messages) {
    const { apiKey, model, baseUrl, maxTokens, temperature } = config;

    const response = await fetch(`${baseUrl}/chat/completions`, {
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
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

async function chatCompletionWithTools(config, messages, tools) {
    const { apiKey, model, baseUrl, maxTokens, temperature } = config;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method:  'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            tools,
            tool_choice: 'auto',
            max_tokens:  maxTokens,
            temperature,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
    }

    const data = await response.json();
    /* Return the full message so the caller can check for tool_calls */
    return data.choices[0].message;
}

module.exports = { chatCompletion, chatCompletionWithTools };
