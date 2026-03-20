const fs = require('fs');
const path = require('path');
const { runAgent } = require('./agent');
const userapi = require('./tools/userapi');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

(async () => {
    // Run the agent without tools — model uppercases by itself
    const response1 = await runAgent(config.model, config.message, [], config.maxIterations);
    console.log(response1);

    // Run the agent with the uppercase tool
    const response2 = await runAgent(config.model, config.message, [userapi], config.maxIterations);
    console.log(response2);
})().catch(err => console.error('Error:', err.message));