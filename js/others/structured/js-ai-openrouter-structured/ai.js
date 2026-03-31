const fs = require('fs');
const path = require('path');

const personSchema = {
    type: "json_schema",
    json_schema: {
    name: "person",
    strict: true,
    schema: {
        type: "object",
        properties: {
            name: {
                type: ["string", "null"],
                description: "Full name of the person. Use null if not mentioned."
            },
            age: {
                type: ["number", "null"],
                description: "Age in years. Use null if not mentioned or unclear."
            },
            occupation: {
                type: ["string", "null"],
                description: "Job title or profession. Use null if not mentioned."
            },
            skills: {
                type: "array",
                items: { type: "string" },
                description: "List of skills, technologies, or competencies. Empty array if none mentioned."
            }
        },
        required: ["name", "age", "occupation", "skills"],
        additionalProperties: false
    }
    }
};

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
            messages: [{ role: 'user', content: message }],
            response_format: personSchema
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

module.exports = { callAI };
