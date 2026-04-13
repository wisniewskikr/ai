/*
 * index.ts — Daytona Hello World
 *
 * What happens here, in order:
 *   1. Connect to Daytona and create an isolated Linux sandbox
 *   2. Resolve the sandbox's actual home directory (don't assume /home/user)
 *   3. Upload hello.ts into the sandbox
 *   4. Install tsx inside the sandbox
 *   5. Run the script and capture its output
 *   6. Delete the sandbox (always — even when something goes wrong)
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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertSuccess(exitCode: number, output: string, label: string): void {
  if (exitCode !== 0) {
    throw new Error(`${label} failed (exit ${exitCode}):\n${output}`);
  }
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
    // --- Step 2: Resolve actual home directory ---
    //
    // Never hardcode /home/user — it varies by image and org config.
    // getUserRootDir() asks the sandbox itself where home is.
    const rootDir = await sandbox.getUserRootDir();
    logger.info(`Sandbox root dir: ${rootDir}`);

    const remoteScriptPath = `${rootDir}/hello.ts`;

    // --- Step 3: Upload script ---
    const localScriptPath = path.resolve(__dirname, "hello.ts");
    logger.info(`Uploading  local=${localScriptPath}  remote=${remoteScriptPath}`);

    // SDK expects a Web API File object (available globally in Node >= 20).
    const scriptBuffer = fs.readFileSync(localScriptPath);
    const scriptFile = new File([scriptBuffer], path.basename(localScriptPath));
    await sandbox.fs.uploadFile(remoteScriptPath, scriptFile);
    logger.info("Upload complete");

    // --- Step 4: Install tsx ---
    //
    // npm install -g is slow but self-contained: no assumptions about what
    // the sandbox image ships with.  If you control the image, bake tsx in.
    logger.info("Installing tsx...");
    const installResult = await sandbox.process.executeCommand(
      "npm install -g tsx --quiet"
    );
    assertSuccess(installResult.exitCode, installResult.result, "tsx installation");
    logger.info("tsx installed");

    // --- Step 5: Run the script ---
    logger.info(`Running: tsx ${remoteScriptPath}`);
    const runResult = await sandbox.process.executeCommand(
      `tsx ${remoteScriptPath}`
    );
    assertSuccess(runResult.exitCode, runResult.result, "Script execution");

    const output = runResult.result.trim();
    logger.info(`Script output: ${output}`);

    // Make it obvious in the terminal — this is what the user came to see.
    console.log(`\n  => ${output}\n`);

  } finally {
    // --- Step 6: Always clean up ---
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
