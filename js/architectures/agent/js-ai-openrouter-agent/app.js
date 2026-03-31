const fs = require('fs');
const path = require('path');
const { runAgent } = require('./agent');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const tools = [];

runAgent(config.model, config.message, tools, config.maxIterations)
    .then(response => console.log(response))
    .catch(err => console.error('Error:', err.message));
