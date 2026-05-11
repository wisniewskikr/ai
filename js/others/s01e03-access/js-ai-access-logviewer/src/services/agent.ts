import OpenAI from 'openai';
import chalk from 'chalk';
import config from '../../config.json' with { type: 'json' };
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { check_user_access, get_file_metadata, list_recent_actions } from '../utils/tools.js';

const client = new OpenAI({
  baseURL: config.openrouterBaseUrl,
  apiKey: process.env.OPENROUTER_API_KEY,
});

const TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'check_user_access',
      description: 'Check if a user has access to a specific resource (read-only)',
      parameters: {
        type: 'object',
        properties: {
          userId:   { type: 'string', description: 'User identifier, e.g. user:42' },
          resource: { type: 'string', description: 'Resource path, e.g. /reports/q4.pdf' },
        },
        required: ['userId', 'resource'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_file_metadata',
      description: 'Get metadata for a file (size, owner, type). Does not return file contents.',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Absolute file path' },
        },
        required: ['filePath'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_recent_actions',
      description: 'List recent agent actions from the audit log',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max number of entries to return (default 10)' },
        },
        required: [],
      },
    },
  },
];

function executeTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'check_user_access':
      return check_user_access(args.userId as string, args.resource as string);
    case 'get_file_metadata':
      return get_file_metadata(args.filePath as string);
    case 'list_recent_actions':
      return list_recent_actions((args.limit as number | undefined) ?? 10);
    default:
      return `Unknown tool: ${name}`;
  }
}

export async function runAgent(question: string): Promise<void> {
  console.log(chalk.cyan(`\n[User]: ${question}`));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: question },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: config.model,
      messages,
      tools: TOOL_DEFINITIONS,
      max_tokens: config.agent.maxTokens,
      temperature: config.agent.temperature,
    });

    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      console.log(chalk.green(`\n[Agent]: ${message.content}`));
      break;
    }

    for (const call of message.tool_calls) {
      const args = JSON.parse(call.function.arguments) as Record<string, unknown>;
      console.log(chalk.yellow(`\n  [Tool call]: ${call.function.name}(${JSON.stringify(args)})`));

      const result = executeTool(call.function.name, args);
      console.log(chalk.gray(`  [Result]: ${result}`));

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: result,
      });
    }
  }
}
