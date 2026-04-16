import { Config } from './config';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export const KNOWLEDGE_TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description: 'Search the knowledge base for information matching a query string.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to look for in the knowledge base.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_topics',
      description: 'List all available topics in the knowledge base.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_entry_by_id',
      description: 'Get the full content of a knowledge base entry by its ID.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'The numeric ID of the entry.',
          },
        },
        required: ['id'],
      },
    },
  },
];

export async function sendMessage(
  history: Message[],
  config: Config,
  tools: Tool[] = KNOWLEDGE_TOOLS,
): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: history,
      tools,
      tool_choice: 'auto',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as {
    choices: {
      message: {
        content: string | null;
        tool_calls?: ToolCall[];
      };
    }[];
  };

  return data.choices[0].message;
}
