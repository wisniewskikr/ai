const fs = require('fs');
const path = require('path');

async function callAI(model, message) {
    const apiKey = fs.readFileSync(path.join(__dirname, '.key'), 'utf8').trim();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: message }]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

module.exports = { callAI };
