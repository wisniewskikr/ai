import config from "../../config.json";

export interface ValidationResult {
  blocked: boolean;
  reason?: string;
}

// Checks user input against known attack patterns (protected mode only)
export function validateInput(input: string): ValidationResult {
  for (const pattern of config.attackPatterns) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(input)) {
      return {
        blocked: true,
        reason: `Matched pattern: "${pattern}"`,
      };
    }
  }
  return { blocked: false };
}

// Checks if the bot's response contains any known private data strings
export function detectPrivateDataLeak(response: string): boolean {
  return config.privateDataPatterns.some((pattern) => response.includes(pattern));
}
