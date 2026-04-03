/**
 * uppercase.js
 *
 * Native tool: to_uppercase.
 *
 * SCHEMA       — OpenAI function-calling schema the model sees.
 * TOOL_HANDLERS — the actual JavaScript that runs when the model calls the tool.
 * executeTool  — looks up the handler and runs it with parsed arguments.
 *
 * To add a new tool: add its schema to TOOLS and its handler to TOOL_HANDLERS.
 * The name must match in both places.
 */

export const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'to_uppercase',
            description: 'Converts the given text to uppercase letters.',
            parameters: {
                type: 'object',
                properties: {
                    text: {
                        type: 'string',
                        description: 'The text to convert to uppercase.',
                    },
                },
                required: ['text'],
            },
        },
    },
];

const TOOL_HANDLERS = {
    to_uppercase({ text }) {
        return text.toUpperCase();
    },
};

/**
 * Executes a tool by name with the given arguments.
 *
 * @param {string} name  - Tool name as declared in TOOLS.
 * @param {object} args  - Parsed JSON arguments from the model.
 * @returns {string}     - Tool output, always a string for the API.
 */
export function executeTool(name, args) {
    const handler = TOOL_HANDLERS[name];
    if (!handler) {
        throw new Error(`Unknown tool: "${name}". Available: ${Object.keys(TOOL_HANDLERS).join(', ')}`);
    }
    return handler(args);
}
