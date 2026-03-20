import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runAgent } from './agent.js';
import { getTools } from './tools.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));

const { tools, client } = await getTools();

// Run the agent without tools — model uppercases by itself
const response1 = await runAgent(config.model, config.message, [], config.maxIterations);
console.log(response1);

// Run the agent with MCP tools
const response2 = await runAgent(config.model, config.message, tools, config.maxIterations);
console.log(response2);

await client.close();
