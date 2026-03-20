import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function callAI(model, messages, tools = []) {
    const apiKey = readFileSync(join(__dirname, '.key'), 'utf8').trim();

    if (typeof messages === 'string') {
        messages = [{ role: 'user', content: messages }];
    }

    const body = { model, messages };

    if (tools.length > 0) {
        body.tools = tools.map(t => ({
            type: 'function',
            function: {
                name: t.definition.name,
                description: t.definition.description,
                parameters: t.definition.parameters,
            }
        }));
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message;
}
