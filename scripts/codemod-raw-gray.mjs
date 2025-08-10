#!/usr/bin/env node
/**
 * codemod-raw-gray.mjs
 * Replaces disallowed raw Tailwind gray utility classes with semantic surface tokens.
 * Mappings:
 *   hover:bg-gray-50|100|200 -> surface-subtle-hover
 *   bg-gray-50|100|200       -> surface-subtle
 *   border-gray-100|200      -> border-subtle
 * After replacement, collapses duplicate spaces inside class strings.
 * Creates backups under .codemod-backups/raw-gray/<relative path> for safety.
 */
import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "fs";
import { join, dirname, relative } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const BACKUP_ROOT = join(ROOT, ".codemod-backups", "raw-gray");

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e.startsWith(".")) continue;
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?|css)$/.test(e)) out.push(full);
  }
  return out;
}

const files = walk(SRC);
let totalReplaced = 0;
const fileSummaries = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let modified = original;
  let fileCount = 0;

  // Order matters: handle hover:* first
  const patterns = [
    {
      re: /(?<![\w-])hover:bg-gray-(50|100|200)\b/g,
      replacement: "surface-subtle-hover",
    },
    { re: /(?<![\w-])bg-gray-(50|100|200)\b/g, replacement: "surface-subtle" },
    { re: /(?<![\w-])border-gray-(100|200)\b/g, replacement: "border-subtle" },
  ];

  for (const { re, replacement } of patterns) {
    modified = modified.replace(re, (m) => {
      fileCount++;
      return replacement;
    });
  }

  if (fileCount) {
    modified = modified.replace(
      /class(Name)?=\"([^\"]+)\"/g,
      (m, g1, classes) => {
        const cleaned = classes.replace(/\s+/g, " ").trim();
        return `class${g1 || ""}="${cleaned}"`;
      }
    );
    if (!existsSync(BACKUP_ROOT)) mkdirSync(BACKUP_ROOT, { recursive: true });
    const rel = relative(ROOT, file);
    const backupPath = join(BACKUP_ROOT, rel);
    const backupDir = dirname(backupPath);
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
    writeFileSync(backupPath, original, "utf8");
    writeFileSync(file, modified, "utf8");
    totalReplaced += fileCount;
    fileSummaries.push({ file: rel, replacements: fileCount });
  }
}

console.log(
  `Raw gray codemod complete. Files changed: ${fileSummaries.length}, total replacements: ${totalReplaced}`
);
for (const f of fileSummaries.slice(0, 40)) {
  console.log(` - ${f.file} (${f.replacements})`);
}
if (fileSummaries.length > 40)
  console.log(` ... ${fileSummaries.length - 40} more files`);
console.log("Backups written to .codemod-backups/raw-gray/");
