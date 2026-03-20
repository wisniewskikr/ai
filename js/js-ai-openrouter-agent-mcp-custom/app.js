import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { runAgent } from './agent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));

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

// Run the agent without tools — model uppercases by itself
const response1 = await runAgent(config.model, config.message, [], config.maxIterations);
console.log(response1);

// Run the agent with MCP tools
const response2 = await runAgent(config.model, config.message, tools, config.maxIterations);
console.log(response2);

await client.close();
