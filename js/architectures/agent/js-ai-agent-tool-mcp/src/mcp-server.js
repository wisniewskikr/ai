/*
 * mcp-server.js - Standalone MCP server.
 *
 * Run as a child process. Communicates with the parent agent over
 * stdio using the Model Context Protocol. Exposes one tool:
 *
 *   to_uppercase(text: string) -> string
 *
 * That is all it does. Keep it simple.
 *
 * NOTE: Do NOT use console.log here. Stdout is the MCP transport.
 *       Use process.stderr.write() for any debug output.
 */

import { Server }               from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'uppercase-server', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'to_uppercase',
      description: 'Converts a string to uppercase letters',
      inputSchema: {
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
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== 'to_uppercase') {
    throw new Error(`Unknown tool: ${name}`);
  }

  if (typeof args?.text !== 'string') {
    throw new Error('to_uppercase: "text" argument must be a string');
  }

  return {
    content: [{ type: 'text', text: args.text.toUpperCase() }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
