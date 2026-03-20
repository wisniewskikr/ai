const fs = require('fs');
const path = require('path');
const { callAI } = require('./ai');
const uppercase = require('./tools/userapi.js');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const tools = [userapi];

// Response without tools
callAI(config.model, config.message)
    .then(response => console.log(response))
    .catch(err => console.error('Error:', err.message));

// Response with tools
callAI(config.model, config.message, tools)
    .then(response => console.log(response))
    .catch(err => console.error('Error:', err.message));
