/**
 * api.js
 *
 * Thin wrapper around the OpenAI SDK (pointing at OpenRouter).
 *
 * createClient()               — initialises the client from env + config.
 * chatCompletion()             — single-turn call, returns the assistant's text.
 * chatCompletionWithTools()    — single-turn call with tools, returns the full message
 *                                object (may contain tool_calls).
 */

import OpenAI from 'openai';

/**
 * Creates and returns an OpenAI-compatible client configured for OpenRouter.
 *
 * @param {object} config - App config (reads config.baseUrl if present).
 * @returns {OpenAI}
 */
export function createClient(config) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set. Check your .env file.');

    return new OpenAI({
        apiKey,
        baseURL: config.baseUrl ?? 'https://openrouter.ai/api/v1',
    });
}

/**
 * Sends a plain chat request and returns only the assistant's text content.
 *
 * @param {OpenAI}   client   - Initialised OpenAI client.
 * @param {object}   config   - App config (model, maxTokens, temperature).
 * @param {object[]} messages - OpenAI message array.
 * @returns {Promise<string>} Trimmed assistant response.
 */
export async function chatCompletion(client, config, messages) {
    const response = await client.chat.completions.create({
        model:       config.model,
        max_tokens:  config.maxTokens,
        temperature: config.temperature,
        messages,
    });
    return response.choices[0].message.content.trim();
}

/**
 * Sends a chat request with tools and returns the full assistant message object.
 * The caller is responsible for handling tool_calls if present.
 *
 * @param {OpenAI}   client     - Initialised OpenAI client.
 * @param {object}   config     - App config (model, maxTokens, temperature).
 * @param {object[]} messages   - OpenAI message array.
 * @param {object[]} tools      - OpenAI tool-schema array.
 * @param {object}   toolChoice - OpenAI tool_choice value.
 * @returns {Promise<object>} Full assistant message (may include tool_calls).
 */
export async function chatCompletionWithTools(client, config, messages, tools, toolChoice) {
    const response = await client.chat.completions.create({
        model:       config.model,
        max_tokens:  config.maxTokens,
        temperature: config.temperature,
        messages,
        tools,
        tool_choice: toolChoice,
    });
    return response.choices[0].message;
}
