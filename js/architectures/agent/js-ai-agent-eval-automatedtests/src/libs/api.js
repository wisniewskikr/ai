'use strict';

/*
 * api.js — OpenRouter chat completions client.
 *
 * Thin wrapper around fetch.  The caller owns the message loop;
 * this module only handles the HTTP round-trip and error surfacing.
 *
 * Returns a normalized response object so agent.js never touches raw JSON.
 */

/*
 * chatWithTools(config, messages, tools)
 *
 * Send a chat completion request with optional tool definitions.
 * Returns:
 *   { message, finish_reason, tool_calls }
 *
 *   message      — full assistant message object
 *   finish_reason — "stop" | "tool_calls" | ...
 *   tool_calls   — array of tool call objects (may be empty)
 */
async function chatWithTools(config, messages, tools) {
    const body = {
        model:      config.model,
        max_tokens: config.maxTokens,
        messages,
    };

    if (tools.length > 0) {
        body.tools       = tools;
        body.tool_choice = 'auto';
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method:  'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API ${response.status}: ${text}`);
    }

    const data    = await response.json();
    const choice  = data.choices[0];
    const message = choice.message;

    return {
        message,
        finish_reason: choice.finish_reason,
        tool_calls:    message.tool_calls ?? [],
    };
}

module.exports = { chatWithTools };
