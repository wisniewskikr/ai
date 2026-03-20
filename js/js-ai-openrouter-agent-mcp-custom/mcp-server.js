import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { definition, execute } from './tools/uppercase.js';
import { z } from 'zod';

const server = new McpServer({ name: 'tools-server', version: '1.0.0' });

server.registerTool(
    definition.name,
    {
        description: definition.description,
        inputSchema: { text: z.string() },
    },
    async (args) => ({
        content: [{ type: 'text', text: execute(args) }],
    })
);

const transport = new StdioServerTransport();
await server.connect(transport);
