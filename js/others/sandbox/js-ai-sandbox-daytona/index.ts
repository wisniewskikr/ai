/*
 * index.ts — Daytona Hello World
 *
 * What happens here, in order:
 *   1. Connect to Daytona and create an isolated Linux sandbox
 *   2. Upload hello.ts into the sandbox
 *   3. Install tsx inside the sandbox and run the script
 *   4. Print whatever the script wrote to stdout
 *   5. Delete the sandbox (always — even when something goes wrong)
 *
 * The sandbox never touches your local machine beyond network calls.
 * That's the whole point.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Daytona } from "@daytonaio/sdk";
import { logger } from "./logger.js";

// ESM equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Where the script will live inside the sandbox
const REMOTE_SCRIPT_PATH = "/home/user/hello.ts";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  logger.info("=== Daytona Hello World ===");

  // Fail fast if credentials are missing — no point continuing otherwise.
  const apiKey = requireEnv("DAYTONA_API_KEY");
  const apiUrl = requireEnv("DAYTONA_BASE_URL");

  const daytona = new Daytona({ apiKey, apiUrl });

  // --- Step 1: Create sandbox ---
  logger.info("Creating sandbox...");
  const sandbox = await daytona.create();
  logger.info(`Sandbox ready  id=${sandbox.id}`);

  try {
    // --- Step 2: Upload script ---
    const localScriptPath = path.resolve(__dirname, "hello.ts");
    logger.info(`Uploading  local=${localScriptPath}  remote=${REMOTE_SCRIPT_PATH}`);

    // SDK expects a Web API File object (available globally in Node >= 20).
    const scriptBuffer = fs.readFileSync(localScriptPath);
    const scriptFile = new File([scriptBuffer], path.basename(localScriptPath));
    await sandbox.fs.uploadFile(REMOTE_SCRIPT_PATH, scriptFile);
    logger.info("Upload complete");

    // --- Step 3: Install tsx and run the script ---
    //
    // npm install -g is slow but self-contained: no assumptions about what
    // the sandbox image ships with.  If you control the image, bake tsx in.
    logger.info("Installing tsx...");
    const installResult = await sandbox.process.executeCommand(
      "npm install -g tsx --quiet"
    );

    if (installResult.exitCode !== 0) {
      throw new Error(
        `tsx installation failed (exit ${installResult.exitCode}):\n${installResult.result}`
      );
    }
    logger.info("tsx installed");

    logger.info(`Running script: tsx ${REMOTE_SCRIPT_PATH}`);
    const runResult = await sandbox.process.executeCommand(
      `tsx ${REMOTE_SCRIPT_PATH}`
    );

    if (runResult.exitCode !== 0) {
      throw new Error(
        `Script exited with code ${runResult.exitCode}:\n${runResult.result}`
      );
    }

    // --- Step 4: Print output ---
    const output = runResult.result.trim();
    logger.info(`Script output: ${output}`);

    // Make it obvious in the terminal — this is what the user came to see.
    console.log(`\n  => ${output}\n`);

  } finally {
    // --- Step 5: Always clean up ---
    //
    // Daytona charges while a sandbox is alive.  The finally block guarantees
    // we delete even when the try block throws.
    logger.info(`Deleting sandbox  id=${sandbox.id}`);
    await sandbox.delete();
    logger.info("Sandbox deleted. All done.");
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error(`Fatal: ${message}`);
  process.exitCode = 1;
});
