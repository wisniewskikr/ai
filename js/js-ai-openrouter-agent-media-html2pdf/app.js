import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { htmlToPdf } from "./src/native/tools.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const htmlPath = "workspace/input/demo.html";
const outputPath = join(__dirname, "workspace/output/demo.pdf");

console.log(`Converting ${htmlPath} → workspace/output/demo.pdf ...`);

await htmlToPdf(htmlPath, outputPath);

console.log("Done.");
