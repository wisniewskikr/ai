import fs from "fs";
import path from "path";

const LOGS_DIR = "logs";

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function getTimestamp() {
  return new Date().toISOString();
}

function getLogFilePath() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOGS_DIR, `workflow-${date}.log`);
}

function writeToFile(message) {
  ensureLogsDir();
  const line = `${getTimestamp()} ${message}\n`;
  fs.appendFileSync(getLogFilePath(), line, "utf8");
}

function formatMessage(level, message) {
  const icons = { INFO: "ℹ️ ", STEP: "➡️ ", SUCCESS: "✅", ERROR: "❌", RESULT: "🎯" };
  return `[${level}] ${icons[level] ?? "  "} ${message}`;
}

export const logger = {
  info(message) {
    const formatted = formatMessage("INFO", message);
    console.log(formatted);
    writeToFile(formatted);
  },
  step(message) {
    const formatted = formatMessage("STEP", message);
    console.log("\n" + formatted);
    writeToFile(formatted);
  },
  success(message) {
    const formatted = formatMessage("SUCCESS", message);
    console.log(formatted);
    writeToFile(formatted);
  },
  error(message) {
    const formatted = formatMessage("ERROR", message);
    console.error(formatted);
    writeToFile(formatted);
  },
  result(label, value) {
    const formatted = formatMessage("RESULT", `${label}: "${value}"`);
    console.log(formatted);
    writeToFile(formatted);
  },
  divider() {
    const line = "─".repeat(60);
    console.log(line);
    writeToFile(line);
  },
};
