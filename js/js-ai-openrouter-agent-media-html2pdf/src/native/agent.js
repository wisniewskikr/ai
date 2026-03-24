import { callAI } from './openrouter.js';
import config from '../../config.json' with { type: 'json' };

export async function runAgent(model, initialMessage, tools = [], maxIterations = config.maxIterations) {
    const messages = [{ role: 'user', content: initialMessage }];
    const toolMap = Object.fromEntries(tools.map(t => [t.definition.name, t]));

    for (let i = 0; i < maxIterations; i++) {
        const response = await callAI(model, messages, tools);
        messages.push(response);

        if (!response.tool_calls || response.tool_calls.length === 0) {
            return response.content;
        }

        for (const toolCall of response.tool_calls) {
            const tool = toolMap[toolCall.function.name];
            if (!tool) {
                throw new Error(`Unknown tool: ${toolCall.function.name}`);
            }

            const args = JSON.parse(toolCall.function.arguments);
            console.log(`[agent] calling tool "${toolCall.function.name}" with`, args);
            const result = await tool.execute(args);
            console.log(`[agent] tool "${toolCall.function.name}" returned`, result);

            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
            });
        }
    }

    throw new Error(`Agent reached maximum iterations (${maxIterations}) without a final response`);
}
