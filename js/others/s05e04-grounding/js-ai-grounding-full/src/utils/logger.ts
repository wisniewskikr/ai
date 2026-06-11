import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.log`);

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function write(level: string, message: string): void {
  ensureLogDir();
  const line = `[${timestamp()}] [${level.padEnd(5)}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  if (level === "ERROR") process.stderr.write(line);
}

export const log = {
  info: (msg: string) => write("INFO", msg),
  warn: (msg: string) => write("WARN", msg),
  error: (msg: string) => write("ERROR", msg),
};
