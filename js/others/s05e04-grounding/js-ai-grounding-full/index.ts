import { runCLI } from "./src/utils/cli";

runCLI().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
