export const Colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export function printBot(message: string): void {
  console.log(`${Colors.cyan}${Colors.bold}Bot:${Colors.reset} ${message}`);
}

export function printUser(message: string): void {
  console.log(`${Colors.green}${Colors.bold}You:${Colors.reset} ${message}`);
}

export function printAlert(message: string): void {
  console.log(
    `\n${Colors.red}${Colors.bold}[!] SECURITY ALERT: ${message}${Colors.reset}\n`
  );
}

export function printBlocked(reason: string): void {
  console.log(
    `\n${Colors.yellow}${Colors.bold}[BLOCKED]${Colors.reset}${Colors.yellow} Attack pattern detected. Message was not sent to the model.${Colors.reset}`
  );
  console.log(`${Colors.dim}Reason: ${reason}${Colors.reset}\n`);
}

export function printInfo(message: string): void {
  console.log(`${Colors.dim}${message}${Colors.reset}`);
}

export function printMode(mode: string): void {
  const color = mode === "vulnerable" ? Colors.red : Colors.green;
  console.log(`\n${color}${Colors.bold}[ Mode: ${mode.toUpperCase()} ]${Colors.reset}\n`);
}
