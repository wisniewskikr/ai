'use strict';

/*
 * mcp-client.js — factory for an MCP stdio client.
 *
 * Spawns the MCP server as a child process (stdio transport) and returns
 * a connected Client instance. The caller is responsible for calling
 * client.close() when done so the child process exits cleanly.
 *
 * Keeping the spawn logic here means all MCP wiring is in one place;
 * agents don't need to know how the server is launched.
 */

const { Client }               = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const path                     = require('path');

const SERVER_PATH = path.join(__dirname, '../mcp/server.js');

/**
 * Create and connect an MCP client backed by the local stdio server.
 *
 * @returns {Promise<import('@modelcontextprotocol/sdk/client/index.js').Client>}
 */
async function createMcpClient() {
    const client = new Client(
        { name: 'agent-client', version: '1.0.0' },
        { capabilities: {} }
    );

    const transport = new StdioClientTransport({
        command: process.execPath,   /* same node binary that's running us */
        args:    [SERVER_PATH],
    });

    await client.connect(transport);
    return client;
}

module.exports = { createMcpClient };
