export const definition = {
    type: "function",
    name: "uppercase",
    description: "Converts a string to uppercase letters",
    strict: false,
    parameters: {
        type: "object",
        properties: {
            text: { type: "string" },
        },
        required: ["text"],
        additionalProperties: false,
    },
};

export const execute = ({ text }) => text.toUpperCase();
