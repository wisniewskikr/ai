import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { htmlToPdf } from "./src/native/tools.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, "config.json"), "utf8"));

const outputPath = join(__dirname, config.output);

console.log(`Converting ${config.input} → ${config.output} ...`);

await htmlToPdf(config.input, outputPath);

console.log("Done.");
