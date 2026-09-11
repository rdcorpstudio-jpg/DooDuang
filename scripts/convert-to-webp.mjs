/**
 * Convert public raster images to WebP and rewrite src references.
 * Run: node scripts/convert-to-webp.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const srcDir = path.join(root, "src");
const EXT = new Set([".png", ".jpg", ".jpeg"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

async function convertFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!EXT.has(ext)) return null;
  const webp = file.slice(0, -ext.length) + ".webp";
  const input = sharp(file, { failOn: "none" });
  const meta = await input.metadata();
  const pipeline =
    meta.hasAlpha || ext === ".png"
      ? input.webp({ quality: 82, alphaQuality: 90, effort: 4 })
      : input.webp({ quality: 82, effort: 4 });
  await pipeline.toFile(webp);
  return { from: file, to: webp };
}

function rewriteText(content) {
  return content
    .replace(/(\/images\/[^"'`)\s?]+)\.png(\?[^"'`)\s]*)?/gi, "$1.webp$2")
    .replace(/(\/images\/[^"'`)\s?]+)\.jpe?g(\?[^"'`)\s]*)?/gi, "$1.webp$2")
    .replace(/(['"`])([^'"`]*\/images\/[^'"`]+)\.png(\?[^'"`]*)?\1/gi, "$1$2.webp$3$1")
    .replace(/(['"`])([^'"`]*\/images\/[^'"`]+)\.jpe?g(\?[^'"`]*)?\1/gi, "$1$2.webp$3$1");
}

async function main() {
  const images = walk(publicDir).filter((f) => EXT.has(path.extname(f).toLowerCase()));
  console.log(`Converting ${images.length} images…`);
  let ok = 0;
  let fail = 0;
  for (const file of images) {
    try {
      await convertFile(file);
      ok += 1;
      if (ok % 40 === 0) console.log(`  ${ok}/${images.length}`);
    } catch (err) {
      fail += 1;
      console.error("FAIL", path.relative(root, file), err.message);
    }
  }
  console.log(`Converted ${ok}, failed ${fail}`);

  const codeFiles = walk(srcDir).filter((f) =>
    /\.(tsx?|jsx?|css|mdx?)$/i.test(f)
  );
  let changed = 0;
  for (const file of codeFiles) {
    const before = fs.readFileSync(file, "utf8");
    const after = rewriteText(before);
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed += 1;
      console.log("updated", path.relative(root, file));
    }
  }
  console.log(`Updated ${changed} source files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
