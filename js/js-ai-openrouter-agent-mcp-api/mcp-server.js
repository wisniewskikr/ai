import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { definition, execute } from './tools/userapi.js';

const server = new McpServer({ name: 'tools-server', version: '1.0.0' });

server.registerTool(
    definition.name,
    {
        description: definition.description,
        inputSchema: {},
    },
    async () => {
        const result = await execute();
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
