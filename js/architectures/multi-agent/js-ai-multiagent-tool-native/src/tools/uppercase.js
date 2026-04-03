'use strict';

/*
 * uppercase.js — native tool: to_uppercase
 *
 * A native tool has two parts:
 *   SCHEMA   — JSON schema sent to the LLM so it knows the tool exists
 *   execute  — the local function invoked when the LLM calls the tool
 *
 * Keeping schema and executor in the same file ensures they never drift
 * out of sync with each other.
 */

const SCHEMA = {
    type: 'function',
    function: {
        name:        'to_uppercase',
        description: 'Converts a text string to uppercase. Use this whenever you need to uppercase text.',
        parameters:  {
            type:       'object',
            properties: {
                text: {
                    type:        'string',
                    description: 'The text to convert to uppercase',
                },
            },
            required: ['text'],
        },
    },
};

function execute(args) {
    const { text } = args;

    if (typeof text !== 'string') {
        throw new Error(`to_uppercase: expected string argument "text", got ${typeof text}`);
    }

    return text.toUpperCase();
}

module.exports = { SCHEMA, execute };
