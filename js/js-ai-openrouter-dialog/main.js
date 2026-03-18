const fs = require('node:fs');
const path = require('node:path');
const { callAI } = require('./ai');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

(async () => {
    try {
        const { model, messageFirst, messageSecond } = config;

        const history = [{ role: 'user', content: messageFirst }];
        const messageFirstReply = await callAI(model, history);

        // Preserve the assistant response and extend the conversation.
        history.push(
            { role: 'assistant', content: messageFirstReply },
            { role: 'user', content: messageSecond }
        );

        const messageSecondReply = await callAI(model, history);
        console.log(messageSecondReply);
    } catch (err) {
        console.error('Error:', err.message);
    }
})();
