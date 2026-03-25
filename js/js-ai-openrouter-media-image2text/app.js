/**
 * Image to Text
 * Asks which image to analyze and prints an AI description.
 */

import { createInterface } from "readline";
import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
import { vision } from "./src/native/vision.js";
import log from "./src/helpers/logger.js";

const IMAGES_FOLDER = "workspace/input";

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp"
};

const ask = (rl, question) =>
  new Promise((resolve) => rl.question(question, resolve));

const listImages = async () => {
  const entries = await readdir(IMAGES_FOLDER, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(e.name))
    .map((e) => e.name);
};

const main = async () => {
  log.box("Image to Text\nAI image description tool");

  const images = await listImages();

  if (images.length === 0) {
    log.error("No images found", `Place images in the ${IMAGES_FOLDER}/ folder`);
    process.exit(1);
  }

  console.log("Available images:\n");
  images.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  console.log();

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  let selected;
  while (!selected) {
    const answer = await ask(rl, "Enter image number or filename: ");
    const num = parseInt(answer, 10);
    if (!isNaN(num) && num >= 1 && num <= images.length) {
      selected = images[num - 1];
    } else if (images.includes(answer.trim())) {
      selected = answer.trim();
    } else {
      console.log("  Invalid selection, try again.\n");
    }
  }

  rl.close();

  log.start(`Analyzing ${selected}...`);

  const imageBuffer = await readFile(join(IMAGES_FOLDER, selected));
  const imageBase64 = imageBuffer.toString("base64");
  const mimeType = MIME_TYPES[extname(selected).toLowerCase()] || "image/jpeg";

  const description = await vision({
    imageBase64,
    mimeType,
    question: "Describe this image in detail. What do you see?"
  });

  console.log();
  log.box("Image Description");
  console.log(description);
  console.log();
};

main().catch((error) => {
  log.error("Error", error.message);
  process.exit(1);
});
