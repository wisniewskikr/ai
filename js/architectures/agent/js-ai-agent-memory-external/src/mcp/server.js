'use strict';

/*
 * server.js — MCP tool server (stdio transport).
 *
 * Exposes two tools for external memory management:
 *   read_memory  — reads memory.txt; returns its content or "" if absent/empty
 *   write_memory — writes text to memory.txt (overwrites)
 *
 * Run standalone: node src/mcp/server.js
 * In normal use:  spawned automatically by the MCP client.
 *
 * NOTE: Do NOT use console.log here. Stdout is the MCP transport.
 */

const { Server }               = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs   = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(process.cwd(), 'memory.txt');

const server = new Server(
    { name: 'memory-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
);

/* ── Tool catalogue ─────────────────────────────────────────────────────── */

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name:        'read_memory',
            description: 'Reads memory.txt and returns its content. Returns an empty string if the file does not exist or is empty.',
            inputSchema: {
                type:       'object',
                properties: {},
                required:   [],
            },
        },
        {
            name:        'write_memory',
            description: 'Writes text to memory.txt, overwriting any existing content.',
            inputSchema: {
                type:       'object',
                properties: {
                    text: {
                        type:        'string',
                        description: 'The text to write to memory.txt.',
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

    if (name === 'read_memory') {
        let content = '';
        try {
            content = fs.readFileSync(MEMORY_FILE, 'utf8').trim();
        } catch (_) {
            /* file missing — return empty string */
        }
        return { content: [{ type: 'text', text: content }] };
    }

    if (name === 'write_memory') {
        if (typeof args.text !== 'string') {
            throw new Error('write_memory requires a string argument "text"');
        }
        fs.writeFileSync(MEMORY_FILE, args.text, 'utf8');
        return { content: [{ type: 'text', text: 'Memory saved.' }] };
    }

    throw new Error(`Unknown tool: ${name}`);
});

/* ── Entry point ────────────────────────────────────────────────────────── */

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    process.stderr.write(`[MCP server] Fatal: ${err.message}\n`);
    process.exit(1);
});
