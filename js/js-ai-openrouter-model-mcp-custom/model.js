import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { callAI } from './ai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));

// Connect to MCP server via stdio
const transport = new StdioClientTransport({
    command: 'node',
    args: [join(__dirname, 'mcp-server.js')],
});

const client = new Client({ name: 'model-client', version: '1.0.0' });
await client.connect(transport);

// Discover tools from MCP server (not imported directly)
const { tools } = await client.listTools();

// Response without tools
console.log('--- Response without tools ---');
const responseNoTools = await callAI(config.model, config.message);
console.log(responseNoTools);

// Response with tools via MCP
console.log('\n--- Response with tools via MCP ---');
const messages = [{ role: 'user', content: config.message }];
const response = await callAI(config.model, messages, tools);

if (response.tool_calls) {
    messages.push(response);

    for (const tc of response.tool_calls) {
        const args = JSON.parse(tc.function.arguments);
        // Execute tool via MCP server, not directly
        const result = await client.callTool({ name: tc.function.name, arguments: args });
        messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: result.content[0].text,
        });
    }

    const finalResponse = await callAI(config.model, messages);
    console.log(finalResponse);
} else {
    console.log(response);
}

await client.close();
