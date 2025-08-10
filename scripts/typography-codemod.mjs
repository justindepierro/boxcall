#!/usr/bin/env node
/**
 * typography-codemod.mjs
 *
 * Converts static <h1..h4 className="..."> utility stacks into
 * <Typography variant=... as="hX" className="...">...</Typography>
 * Only transforms headings with a literal double-quoted className containing
 * size + weight utilities (text-4xl|3xl|2xl|xl|lg|sm and font-bold|semibold|medium).
 * Dynamic class expressions or template literals are skipped safely.
 *
 * Usage:
 *   node scripts/typography-codemod.mjs            (dry run)
 *   node scripts/typography-codemod.mjs --write    (apply changes)
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const WRITE = process.argv.includes("--write");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(e)) out.push(full);
  }
  return out;
}

// Variant decision based on size + weight tokens present
function decideVariant(classes) {
  const has = (p) => classes.includes(p);
  if (has("text-6xl") || has("text-5xl")) return "display-xl";
  if (has("text-4xl") && has("font-bold")) return "headline-xl";
  if (has("text-3xl")) return "headline-lg";
  if (has("text-2xl")) return "headline-md";
  if (has("text-xl")) return "headline-sm";
  if (
    has("text-lg") &&
    (has("font-semibold") || has("font-medium") || has("font-bold"))
  )
    return "headline-sm";
  if (has("text-sm") && has("font-semibold")) return "label-lg";
  return null; // Unknown -> skip
}

// Remove tokens that the variant supplies
const SIZE_WEIGHT_RE =
  /(^|\s)(text-(?:[0-9]xl|xl|lg|sm)|font-(?:bold|semibold|medium)|font-display)(?=\s|$)/g;

const headingRegex =
  /<h([1-4])([^>]*?)className="([^"]+)"([^>]*)>([\s\S]*?)<\/h\1>/g;

const files = walk(SRC);
let transformedFiles = 0;
let transformedHeadings = 0;
let skippedDynamic = 0;
let skippedUnmapped = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let modified = original;
  let any = false;
  let match;
  while ((match = headingRegex.exec(original))) {
    const [full, level, preAttr, classValue, postAttr, inner] = match;
    // Skip if className contains template markers (should not due to regex) but defensively
    if (/[`'$]{/.test(classValue)) {
      skippedDynamic++;
      continue;
    }
    const classes = classValue.trim().split(/\s+/);
    const variant = decideVariant(classes);
    if (!variant) {
      skippedUnmapped++;
      continue;
    }
    // Build remaining class list after stripping size + weight tokens
    const remaining = classValue
      .replace(SIZE_WEIGHT_RE, " ")
      .replace(/\s+/g, " ")
      .trim();
    const classAttr = remaining ? ` className="${remaining}"` : "";
    const replacement = `<Typography variant="${variant}" as="h${level}"${classAttr}>${inner}</Typography>`;
    modified = modified.replace(full, replacement);
    transformedHeadings++;
    any = true;
  }
  if (any) {
    transformedFiles++;
    if (WRITE && modified !== original) {
      writeFileSync(file, modified, "utf8");
    }
  }
}

console.log(`Typography Codemod ${WRITE ? "WRITE" : "DRY-RUN"} Summary`);
console.log("-----------------------------------------");
console.log(`Files scanned: ${files.length}`);
console.log(`Files with changes: ${transformedFiles}`);
console.log(`Headings transformed: ${transformedHeadings}`);
console.log(`Skipped (dynamic class): ${skippedDynamic}`);
console.log(`Skipped (unmapped pattern): ${skippedUnmapped}`);
if (!WRITE) console.log("\n(Re-run with --write to apply changes)");

if (transformedHeadings === 0 && !WRITE) {
  console.log("No eligible headings found (or already migrated).");
}
