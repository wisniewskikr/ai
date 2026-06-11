import { evaluate } from "mathjs";

export function calculate(expression: string): string {
  try {
    const result = evaluate(expression);
    return `${expression} = ${result}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot evaluate "${expression}": ${message}`);
  }
}
