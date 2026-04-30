import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { SYSTEM_PROMPT } from "../prompts/system-prompt.js";

dotenv.config();

type Config = {
  model: string;
  maxTokens: number;
  maxAgentIterations: number;
};

const config: Config = JSON.parse(readFileSync("config.json", "utf-8"));

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

function buildOpenAITools(tools: Awaited<ReturnType<Client["listTools"]>>["tools"]): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Record<string, unknown>,
    },
  }));
}

async function callMcpTool(client: Client, name: string, args: Record<string, unknown>): Promise<string> {
  const result = await client.callTool({ name, arguments: args });
  return result.content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

export async function runAgent(serverScript: string, userPrompt: string): Promise<string> {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", serverScript],
  });

  const client = new Client({ name: "demo-agent", version: "1.0.0" });
  await client.connect(transport);

  const { tools } = await client.listTools();
  const openaiTools = buildOpenAITools(tools);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  for (let i = 0; i < config.maxAgentIterations; i++) {
    const response = await openai.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens,
      messages,
      tools: openaiTools,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    if (choice.finish_reason === "stop" || !assistantMessage.tool_calls?.length) {
      await client.close();
      return assistantMessage.content ?? "";
    }

    for (const toolCall of assistantMessage.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      const toolResult = await callMcpTool(client, toolCall.function.name, args);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }
  }

  await client.close();
  throw new Error("Agent exceeded max iterations without finishing");
}
