import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function getTools() {
    const transport = new StdioClientTransport({
        command: 'node',
        args: [join(__dirname, 'mcp-server.js')],
    });

    const client = new Client({ name: 'app-client', version: '1.0.0' });
    await client.connect(transport);

    const { tools: mcpTools } = await client.listTools();

    const tools = mcpTools.map(tool => ({
        definition: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
        },
        execute: async (args) => {
            const result = await client.callTool({ name: tool.name, arguments: args });
            return result.content[0].text;
        },
    }));

    return { tools, client };
}
