import type OpenAI from 'openai';
import { getDatabase } from './db';

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  created_at: string;
};

export const toolDefinitions: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'list_products',
      description: 'List all products in the catalog',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of products to return (default: 50)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search products by name or category',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term matched against product name or category',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product',
      description: 'Get a single product by its ID',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Product ID',
          },
        },
        required: ['id'],
      },
    },
  },
];

function listProducts(limit = 50): Product[] {
  return getDatabase().prepare('SELECT * FROM products LIMIT ?').all(limit) as Product[];
}

function searchProducts(query: string): Product[] {
  return getDatabase()
    .prepare('SELECT * FROM products WHERE name LIKE ? OR category LIKE ?')
    .all(`%${query}%`, `%${query}%`) as Product[];
}

function getProduct(id: number): Product | null {
  return (getDatabase().prepare('SELECT * FROM products WHERE id = ?').get(id) as Product) ?? null;
}

export function executeToolCall(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case 'list_products':
      return listProducts((args.limit as number) ?? 50);
    case 'search_products':
      return searchProducts(args.query as string);
    case 'get_product':
      return getProduct(args.id as number);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
