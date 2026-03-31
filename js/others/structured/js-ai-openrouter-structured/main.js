const fs = require('fs');
const path = require('path');
const { callAI } = require('./ai');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

callAI(config.model, config.message)
    .then(person => {
        console.log('Name:', person.name);
        console.log('Age:', person.age);
        console.log('Occupation:', person.occupation);
        console.log('Skills:', person.skills.join(', '));
    })
    .catch(err => console.error('Error:', err.message));
