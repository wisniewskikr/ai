/*
 * agent.js — stateless agent (no tools)
 *
 * Responsibility: send a prompt to the model and return the response.
 * Nothing more.  Logging, config loading, and error presentation live
 * in index.js — not here.
 *
 * "No tools" means no function-calling loop.  The model either answers
 * or it doesn't.  One request, one response.
 */

import OpenAI from 'openai';

/*
 * System prompt is intentionally restrictive: we want ONLY uppercase text
 * back, no prose, no apologies, no markdown.
 */
const SYSTEM_PROMPT =
    'You are a text transformer. ' +
    'Your sole job is to return the user text converted to UPPERCASE. ' +
    'Return only the transformed text — no explanation, no punctuation changes.';

/*
 * runAgent — call the model once and return the result.
 *
 * @param {object} opts
 * @param {string} opts.prompt   — text to transform
 * @param {string} opts.model    — model identifier (OpenRouter format)
 * @param {string} opts.apiKey   — OpenRouter API key
 *
 * @returns {Promise<{ output: string, usage: object }>}
 * @throws  on any network or API error
 */
export async function runAgent({ prompt, model, apiKey }) {
    const client = new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
    });

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
    ];

    const response = await client.chat.completions.create({ model, messages });

    const { message } = response.choices[0];
    const { usage }   = response;

    return {
        output: message.content.trim(),
        usage: {
            prompt_tokens:     usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens:      usage.total_tokens,
        },
    };
}
