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

import { McpServer }            from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z }                    from 'zod';

const server = new McpServer(
  { name: 'uppercase-server', version: '1.0.0' },
);

server.registerTool(
  'to_uppercase',
  {
    description: 'Converts a string to uppercase letters',
    inputSchema: { text: z.string().describe('The text to convert to uppercase') },
  },
  async ({ text }) => ({
    content: [{ type: 'text', text: text.toUpperCase() }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
