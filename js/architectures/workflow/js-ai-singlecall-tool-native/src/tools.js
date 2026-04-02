// Native tool definitions (OpenAI-compatible function calling format)
export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "to_uppercase",
      description: "Converts the given text to uppercase letters.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to convert to uppercase.",
          },
        },
        required: ["text"],
      },
    },
  },
];

// Tool implementations
export const toolHandlers = {
  to_uppercase({ text }) {
    return text.toUpperCase();
  },
};

export function executeTool(name, args) {
  const handler = toolHandlers[name];
  if (!handler) throw new Error(`Unknown tool: ${name}`);
  return handler(args);
}
