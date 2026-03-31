import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "hello-world-mcp",
  version: "1.0.0",
});

server.tool(
  "to_uppercase",
  "Converts the given text to uppercase letters.",
  { text: z.string().describe("The text to convert to uppercase.") },
  async ({ text }) => ({
    content: [{ type: "text", text: text.toUpperCase() }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
