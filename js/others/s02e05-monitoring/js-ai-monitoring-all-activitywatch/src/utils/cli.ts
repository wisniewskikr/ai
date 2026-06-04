import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

export function closeReadline(): void {
  rl.close();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isYes(answer: string): boolean {
  return answer === "y";
}

export function isQuit(answer: string): boolean {
  return answer === "q";
}

export function log(level: "INFO" | "WARN" | "ERROR", message: string): void {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8);
  console.log(`[${date} ${time}] [${level.padEnd(5)}] ${message}`);
}
