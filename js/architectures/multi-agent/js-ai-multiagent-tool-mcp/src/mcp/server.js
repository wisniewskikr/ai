'use strict';

/*
 * server.js — MCP tool server (stdio transport).
 *
 * Exposes a single tool: to_uppercase(text) → TEXT.
 * Intentionally trivial — the point is to show the MCP wiring pattern,
 * not to do anything clever with the transformation itself.
 *
 * Run standalone: node src/mcp/server.js
 * In normal use: spawned automatically by the MCP client.
 */

const { Server }              = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport} = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const server = new Server(
    { name: 'uppercase-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
);

/* ── Tool catalogue ─────────────────────────────────────────────────────── */

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name:        'to_uppercase',
            description: 'Converts a text string to uppercase and returns it.',
            inputSchema: {
                type:       'object',
                properties: {
                    text: {
                        type:        'string',
                        description: 'The text to convert to uppercase.',
                    },
                },
                required: ['text'],
            },
        },
    ],
}));

/* ── Tool execution ─────────────────────────────────────────────────────── */

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name !== 'to_uppercase') {
        throw new Error(`Unknown tool: ${name}`);
    }

    if (typeof args.text !== 'string') {
        throw new Error('to_uppercase requires a string argument "text"');
    }

    return {
        content: [{ type: 'text', text: args.text.toUpperCase() }],
    };
});

/* ── Entry point ────────────────────────────────────────────────────────── */

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error('[MCP server] Fatal:', err.message);
    process.exit(1);
});
