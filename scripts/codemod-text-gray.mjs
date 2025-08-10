#!/usr/bin/env node
/**
 * codemod-text-gray.mjs
 * Replaces disallowed raw Tailwind text-gray-* utilities with semantic text tokens.
 * Mapping (light mode target):
 *   text-gray-500 -> text-text-muted
 *   text-gray-600 -> text-text-secondary
 *   text-gray-700|800|900 -> text-text-primary
 * Notes:
 *   - Only replaces base text color utilities (no hover:, focus:, dark: prefixed variants) to avoid
 *     breaking Tailwind variant syntax or mixed dark-mode specificity. Dark mode semantic classes
 *     are handled via existing .text-text-* definitions.
 *   - Cleans duplicate whitespace inside class attributes after replacement.
 *   - Writes backups to .codemod-backups/text-gray/<relative path> before modifying.
 */
import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const BACKUP_ROOT = join(ROOT, ".codemod-backups", "text-gray");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e.startsWith(".")) continue;
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(e)) out.push(full);
  }
  return out;
}

const replaceMap = new Map([
  ["text-gray-500", "text-text-muted"],
  ["text-gray-600", "text-text-secondary"],
  ["text-gray-700", "text-text-primary"],
  ["text-gray-800", "text-text-primary"],
  ["text-gray-900", "text-text-primary"],
]);

const files = walk(SRC);
let total = 0;
const summaries = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let modified = original;
  let count = 0;

  // Only operate inside className / class="..." literals to reduce false positives
  modified = modified.replace(
    /class(Name)?=\"([^\"]+)\"/g,
    (full, g1, classes) => {
      let updated = classes;
      for (const [raw, semantic] of replaceMap.entries()) {
        // Skip if part of a variant like hover:text-gray-600 (colon present before token)
        const variantRe = new RegExp(`(?<![\\\w:-])${raw}(?![\\w-])`, "g");
        updated = updated.replace(variantRe, (m, offset) => {
          // If immediately preceded by a ':' retain (it's a variant) – skip
          if (offset > 0 && classes[offset - 1] === ":") return m;
          count++;
          return semantic;
        });
      }
      if (count) {
        const cleaned = updated.replace(/\s+/g, " ").trim();
        return `class${g1 || ""}="${cleaned}"`;
      }
      return full;
    }
  );

  if (count) {
    if (!existsSync(BACKUP_ROOT)) mkdirSync(BACKUP_ROOT, { recursive: true });
    const rel = relative(ROOT, file);
    const backupPath = join(BACKUP_ROOT, rel);
    const backupDir = dirname(backupPath);
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
    writeFileSync(backupPath, original, "utf8");
    writeFileSync(file, modified, "utf8");
    total += count;
    summaries.push({ file: rel, replacements: count });
  }
}

console.log(
  `Text gray codemod complete. Files changed: ${summaries.length}, total replacements: ${total}`
);
for (const s of summaries.slice(0, 40))
  console.log(` - ${s.file} (${s.replacements})`);
if (summaries.length > 40)
  console.log(` ... ${summaries.length - 40} more files`);
console.log("Backups written to .codemod-backups/text-gray/");
