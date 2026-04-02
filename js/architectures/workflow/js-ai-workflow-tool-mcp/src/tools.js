/**
 * MCP Tool definitions (OpenAI function-calling format, compatible with OpenRouter).
 * Each tool has a JSON schema and a local handler function.
 */

const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'to_uppercase',
      description: 'Converts the given text to uppercase letters',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to convert to uppercase',
          },
        },
        required: ['text'],
      },
    },
  },
];

/**
 * Execute a tool by name with the given arguments.
 * @param {string} name - Tool name
 * @param {object} args - Parsed arguments object
 * @returns {string} Tool result as a string
 */
function executeTool(name, args) {
  switch (name) {
    case 'to_uppercase':
      return args.text.toUpperCase();
    default:
      throw new Error(`Unknown tool: "${name}"`);
  }
}

module.exports = { toolDefinitions, executeTool };
