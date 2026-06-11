export interface ToolInputSchema {
  type: "object";
  properties: Record<string, { type: string; description: string }>;
  required: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: ToolInputSchema;
}

export interface RegistryEntry {
  name: string;
  cost: "none" | "low" | "medium" | "high";
  limitPerDay: number | null;
  tags: string[];
  fallback?: string;
  definition: ToolDefinition;
}

export interface AppConfig {
  model: string;
  maxTokens: number;
  routerModel: string;
  routerMaxTokens: number;
  requestTimeoutMs: number;
  tools: Record<string, { cost: string; limitPerDay: number | null }>;
}

// OpenAI-compatible message types (used with OpenRouter)
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenRouterTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: ToolInputSchema;
  };
}

export interface OpenRouterResponse {
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
}
