import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "calculator-safe",
  version: "1.0.0",
});

server.tool(
  "calculate",
  "Performs math calculations.",
  { expression: z.string().describe("Math expression to evaluate, e.g. '2+2'") },
  async ({ expression }) => {
    // NOTE: Function() eval is intentional here — demo purposes only, not for production
    const result = Function(`"use strict"; return (${expression})`)();
    return { content: [{ type: "text", text: String(result) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
