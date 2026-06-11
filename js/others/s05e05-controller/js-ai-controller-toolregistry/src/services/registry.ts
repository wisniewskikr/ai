import { RegistryEntry } from "../types";

export const toolRegistry: RegistryEntry[] = [
  {
    name: "check_weather",
    cost: "low",
    limitPerDay: 100,
    tags: ["weather", "local"],
    definition: {
      name: "check_weather",
      description: "Checks the current weather for a given city.",
      input_schema: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "Name of the city to check weather for",
          },
        },
        required: ["city"],
      },
    },
  },
  {
    name: "translate_text",
    cost: "low",
    limitPerDay: 200,
    tags: ["language", "translation"],
    definition: {
      name: "translate_text",
      description: "Translates text between Polish and English or other language pairs.",
      input_schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Text to translate",
          },
          targetLanguage: {
            type: "string",
            description: "Target language, e.g. English, Polish, German",
          },
        },
        required: ["text", "targetLanguage"],
      },
    },
  },
  {
    name: "calculate",
    cost: "none",
    limitPerDay: null,
    tags: ["math", "local"],
    definition: {
      name: "calculate",
      description: "Evaluates a mathematical expression and returns the numeric result.",
      input_schema: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate, e.g. '2 + 2' or 'sqrt(16) * 3'",
          },
        },
        required: ["expression"],
      },
    },
  },
  {
    name: "summarize",
    cost: "medium",
    limitPerDay: 50,
    tags: ["text", "nlp"],
    fallback: "translate_text",
    definition: {
      name: "summarize",
      description: "Summarizes a long text into 2-3 concise sentences.",
      input_schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Text to summarize",
          },
        },
        required: ["text"],
      },
    },
  },
];
