import fs from "fs";
import path from "path";
import {
  AppConfig,
  ChatMessage,
  OpenRouterTool,
  OpenRouterResponse,
  RegistryEntry,
} from "../types";
import { toolRegistry, getAllTags, filterByTags } from "./registry";
import { checkWeather } from "./weather";
import { translateText } from "./translator";
import { calculate } from "./calculator";
import { summarize } from "./summarizer";
import { logger, getUsageCount, incrementUsage } from "../utils/logger";
import { callLLM } from "../utils/llm";

const config = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config.json"), "utf8")
) as AppConfig;

const systemPrompt = fs.readFileSync(
  path.join(process.cwd(), "src/prompts/agent.md"),
  "utf8"
);

const routerPrompt = fs.readFileSync(
  path.join(process.cwd(), "src/prompts/router.md"),
  "utf8"
);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_TURNS = 10;

function buildTools(registry: RegistryEntry[]): OpenRouterTool[] {
  return registry.map((entry) => ({
    type: "function" as const,
    function: {
      name: entry.definition.name,
      description: entry.definition.description,
      parameters: entry.definition.input_schema,
    },
  }));
}

async function callOpenRouter(messages: ChatMessage[], tools: OpenRouterTool[]): Promise<OpenRouterResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        messages,
        tools,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<OpenRouterResponse>;
  } finally {
    clearTimeout(timeout);
  }
}

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  switch (name) {
    case "check_weather":
      return checkWeather(args.city);
    case "translate_text":
      return translateText(args.text, args.targetLanguage, config);
    case "calculate":
      return calculate(args.expression);
    case "summarize":
      return summarize(args.text, config);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function routeTags(userMessage: string): Promise<string[]> {
  const allTags = getAllTags();
  const userPrompt = `User query: "${userMessage}"\n\nAvailable tags: ${JSON.stringify(allTags)}`;
  logger.info(`Router using model: ${config.routerModel}`);
  const result = await callLLM(userPrompt, routerPrompt, config, config.routerModel, config.routerMaxTokens);
  try {
    const tags = JSON.parse(result) as string[];
    if (Array.isArray(tags) && tags.length > 0) return tags;
    throw new Error("Empty or invalid array");
  } catch {
    logger.warn("Router returned unparseable response — falling back to all tools");
    return allTags;
  }
}

function isWithinLimit(toolName: string): boolean {
  const toolConfig = config.tools[toolName];
  if (!toolConfig || toolConfig.limitPerDay === null) return true;
  return getUsageCount(toolName) < toolConfig.limitPerDay;
}

function warnIfApproachingLimit(toolName: string): void {
  const toolConfig = config.tools[toolName];
  if (!toolConfig || toolConfig.limitPerDay === null) return;
  const count = getUsageCount(toolName);
  const limit = toolConfig.limitPerDay;
  if (count >= limit * 0.9) {
    logger.warn(`Approaching daily limit: ${toolName} (${count}/${limit})`);
  }
}

export async function runAgent(userMessage: string): Promise<string> {
  // Phase 1: route — select relevant tags, then filter tools
  const selectedTags = await routeTags(userMessage);
  logger.info(`Router selected tags: [${selectedTags.join(", ")}]`);

  let filteredRegistry = filterByTags(selectedTags);
  if (filteredRegistry.length === 0) {
    logger.warn("No tools matched selected tags — falling back to full registry");
    filteredRegistry = toolRegistry;
  }
  logger.info(`Tools after filtering: [${filteredRegistry.map((e) => e.name).join(", ")}]`);

  // Phase 2: agent — run with filtered tools only
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];
  const tools = buildTools(filteredRegistry);

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const data = await callOpenRouter(messages, tools);
    const choice = data.choices[0];
    const finishReason = choice.finish_reason;

    // Model finished — return the text response
    if (finishReason === "stop" || finishReason === "end_turn") {
      return choice.message.content ?? "";
    }

    // Model hit token limit — response is incomplete
    if (finishReason === "max_tokens") {
      throw new Error("Response was cut off — max_tokens limit reached.");
    }

    // Model wants to call tools
    if (finishReason === "tool_calls") {
      messages.push(choice.message);

      const toolCalls = choice.message.tool_calls ?? [];
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, string>;

        logger.info(`Agent selected tool: ${toolName}`);

        if (!isWithinLimit(toolName)) {
          const count = getUsageCount(toolName);
          const limit = config.tools[toolName]?.limitPerDay;
          logger.error(`Daily limit exceeded: ${toolName} (${count}/${limit}) — request rejected`);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: Daily limit exceeded for ${toolName} (${count}/${limit} uses today).`,
          });
          continue;
        }

        const startTime = Date.now();
        try {
          const result = await executeTool(toolName, toolArgs);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          incrementUsage(toolName);
          warnIfApproachingLimit(toolName);
          logger.info(`Tool executed successfully — time: ${elapsed}s`);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.error(`Tool ${toolName} failed: ${message}`);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: ${message}`,
          });
        }
      }
      continue;
    }

    throw new Error(`Unexpected finish_reason: ${finishReason}`);
  }

  throw new Error("Agent loop exceeded maximum turns.");
}
