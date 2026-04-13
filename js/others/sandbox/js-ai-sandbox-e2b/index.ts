/*
 * index.ts — E2B Hello World
 *
 * What happens here, in order:
 *   1. Create an isolated E2B sandbox
 *   2. Upload hello.ts into the sandbox
 *   3. Install tsx inside the sandbox
 *   4. Run the script and capture its output
 *   5. Kill the sandbox (always — even when something goes wrong)
 *
 * Non-secret config lives in config.json.
 * Secrets (API keys) live in .env.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sandbox } from "e2b";
import { logger } from "./logger.js";

// ESM equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface Config {
  sandbox: {
    scriptName: string;
  };
}

function loadConfig(): Config {
  const configPath = path.resolve(__dirname, "config.json");
  const raw = fs.readFileSync(configPath, "utf8");
  return JSON.parse(raw) as Config;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  logger.info("=== E2B Hello World ===");

  const config = loadConfig();

  // API key is a secret — stays in .env, never in config.json.
  const apiKey = requireEnv("E2B_API_KEY");

  // --- Step 1: Create sandbox ---
  logger.info("Creating sandbox...");
  const sandbox = await Sandbox.create({ apiKey });
  logger.info(`Sandbox ready  id=${sandbox.sandboxId}`);

  try {
    const remoteScriptPath = `/home/user/${config.sandbox.scriptName}`;

    // --- Step 2: Upload script ---
    const localScriptPath = path.resolve(__dirname, config.sandbox.scriptName);
    logger.info(`Uploading  local=${localScriptPath}  remote=${remoteScriptPath}`);

    const scriptContent = fs.readFileSync(localScriptPath, "utf8");
    await sandbox.files.write(remoteScriptPath, scriptContent);
    logger.info("Upload complete");

    // --- Step 3: Install tsx ---
    logger.info("Installing tsx...");
    const installResult = await sandbox.commands.run("npm install -g tsx --quiet");
    if (installResult.exitCode !== 0) {
      throw new Error(`tsx installation failed (exit ${installResult.exitCode}):\n${installResult.stdout}`);
    }
    logger.info("tsx installed");

    // --- Step 4: Run the script ---
    logger.info(`Running: tsx ${remoteScriptPath}`);
    const runResult = await sandbox.commands.run(`tsx ${remoteScriptPath}`);
    if (runResult.exitCode !== 0) {
      throw new Error(`Script execution failed (exit ${runResult.exitCode}):\n${runResult.stderr}`);
    }

    const output = runResult.stdout.trim();
    logger.info(`Script output: ${output}`);

    // Make it obvious in the terminal — this is what the user came to see.
    console.log(`\n  => ${output}\n`);

  } finally {
    // --- Step 5: Always clean up ---
    //
    // E2B charges while a sandbox is alive.  The finally block guarantees
    // we kill even when the try block throws.
    logger.info(`Killing sandbox  id=${sandbox.sandboxId}`);
    await sandbox.kill();
    logger.info("Sandbox killed. All done.");
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error(`Fatal: ${message}`);
  process.exitCode = 1;
});
