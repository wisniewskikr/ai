const fs = require('fs');
const path = require('path');
const { callAI } = require('./ai');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

callAI(config.model, config.message)
    .then(response => console.log(response))
    .catch(err => console.error('Error:', err.message));
