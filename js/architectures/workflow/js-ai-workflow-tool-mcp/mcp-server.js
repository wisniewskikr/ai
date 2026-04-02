/**
 * MCP Server — exposes the "to_uppercase" tool via stdio transport.
 *
 * This is a standalone process. The workflow spawns it as a child process
 * and communicates with it using the Model Context Protocol over stdin/stdout.
 *
 * Run directly (for testing):
 *   node mcp-server.js
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'hello-world-mcp-server',
  version: '1.0.0',
});

// Register the "to_uppercase" tool
server.registerTool(
  'to_uppercase',
  {
    description: 'Converts the given text to uppercase letters',
    inputSchema: { text: z.string().describe('The text to convert to uppercase') },
  },
  async ({ text }) => ({
    content: [{ type: 'text', text: text.toUpperCase() }],
  }),
);

// Start server on stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
