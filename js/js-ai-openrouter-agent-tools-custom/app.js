const fs = require('fs');
const path = require('path');
const { runAgent } = require('./agent');
const { uppercase } = require('./tools/uppercase');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const tools = [];

// Run the agent without tools
runAgent(config.model, config.message, tools, config.maxIterations)
    .then(response => console.log(response))
    .catch(err => console.error('Error:', err.message));

tools.push(uppercase);

// Run the agent with tools
runAgent(config.model, config.message, tools, config.maxIterations)
    .then(response => console.log(response))
    .catch(err => console.error('Error:', err.message));