import { readFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../..");

const ensureDir = async (dir) => {
  await mkdir(dir, { recursive: true });
};

/**
 * Convert an HTML file to PDF using Puppeteer.
 * @param {string} htmlPath - Path to HTML file relative to project root
 * @param {string} outputPath - Absolute path for the output PDF
 * @param {object} options - PDF options (format, landscape, margin, printBackground)
 */
export async function htmlToPdf(htmlPath, outputPath, options = {}) {
  const fullHtmlPath = join(PROJECT_ROOT, htmlPath);

  await readFile(fullHtmlPath); // throws if file not found

  await ensureDir(dirname(outputPath));

  const pdfOptions = {
    path: outputPath,
    format: options.format || "A4",
    landscape: options.landscape || false,
    printBackground: options.printBackground !== false,
    margin: options.margin || {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm"
    }
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${fullHtmlPath}`, { waitUntil: "networkidle0" });
    await page.pdf(pdfOptions);
  } finally {
    await browser.close();
  }
}
