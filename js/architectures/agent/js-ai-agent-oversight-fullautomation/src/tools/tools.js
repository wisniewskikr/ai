'use strict';

/*
 * tools.js — tool catalogue available to the agent.
 *
 * Each tool has:
 *   definitions  — OpenAI function-calling schema (passed to the API)
 *   execute()    — local implementation called when the model requests it
 *
 * Adding a new tool: append to `definitions` and add a matching branch in
 * `execute`.  Keep each tool's logic self-contained; no shared mutable state.
 */

const fs   = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ */
/* Tool definitions — OpenAI function-calling format                   */
/* ------------------------------------------------------------------ */

const definitions = [
    {
        type: 'function',
        function: {
            name: 'write_file',
            description:
                'Write text content to a file. ' +
                'Creates any missing parent directories. ' +
                'Overwrites the file if it already exists.',
            parameters: {
                type:       'object',
                properties: {
                    path: {
                        type:        'string',
                        description: 'File path relative to the project root (e.g. "workspace/output.txt").',
                    },
                    content: {
                        type:        'string',
                        description: 'Text content to write to the file.',
                    },
                },
                required: ['path', 'content'],
            },
        },
    },
];

/* ------------------------------------------------------------------ */
/* Tool execution                                                       */
/* ------------------------------------------------------------------ */

/*
 * execute(name, args) — dispatch a tool call and return a result string.
 *
 * The returned string is fed back to the model as the tool result.
 * Throw on invalid input so the model gets a clear error message.
 */
function execute(name, args) {
    if (name === 'write_file') {
        return writeFile(args);
    }

    throw new Error(`Unknown tool: "${name}"`);
}

function writeFile({ path: relPath, content }) {
    if (typeof relPath  !== 'string') throw new Error('write_file: "path" must be a string');
    if (typeof content  !== 'string') throw new Error('write_file: "content" must be a string');

    const absPath = path.join(process.cwd(), relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, 'utf8');

    return `OK — wrote ${content.length} chars to "${relPath}"`;
}

/* ------------------------------------------------------------------ */

module.exports = { definitions, execute };
