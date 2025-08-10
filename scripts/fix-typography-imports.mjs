#!/usr/bin/env node
/**
 * fix-typography-imports.mjs
 * Scans all TS/TSX/JSX files for <Typography usage without an existing import
 * and inserts: import { Typography } from "<relative path to components/design-system/Typography";
 * Skips files already importing Typography (named or default) to avoid duplicates.
 *
 * Usage:
 *   node scripts/fix-typography-imports.mjs        (dry run)
 *   node scripts/fix-typography-imports.mjs --write (apply changes)
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname; // repo
const SRC = path.join(ROOT, "src");
const TARGET = path.join(SRC, "components", "design-system", "Typography");
const WRITE = process.argv.includes("--write");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

function hasTypographyUsage(txt) {
  return /<Typography[\s>]/.test(txt);
}
function hasImport(txt) {
  return /import\s+{?\s*Typography\s*}?\s+from\s+["'].*Typography["']/.test(
    txt
  );
}

const files = walk(SRC);
let candidates = 0;
let updated = 0;

for (const file of files) {
  const txt = readFileSync(file, "utf8");
  if (!hasTypographyUsage(txt)) continue;
  if (hasImport(txt)) continue;
  candidates++;
  // Determine relative import path
  const relDir = path.dirname(file);
  let rel = path.relative(relDir, TARGET); // e.g. ../../components/design-system/Typography
  if (!rel.startsWith(".")) rel = "./" + rel;
  rel = rel.split(path.sep).join("/");
  const importLine = `import { Typography } from "${rel}";`;
  // Insert after first import block
  const lines = txt.split(/\n/);
  let insertIdx = 0;
  while (insertIdx < lines.length && lines[insertIdx].startsWith("import"))
    insertIdx++;
  lines.splice(insertIdx, 0, importLine);
  const out = lines.join("\n");
  if (WRITE) writeFileSync(file, out, "utf8");
  updated++;
}

console.log(`Typography import fixer ${WRITE ? "WRITE" : "DRY-RUN"} summary`);
console.log("---------------------------------------");
console.log(`Files scanned: ${files.length}`);
console.log(`Files missing import (found): ${candidates}`);
console.log(`Files ${WRITE ? "updated" : "to update"}: ${updated}`);
if (!WRITE) console.log("\nRun with --write to apply.");
