#!/usr/bin/env tsx
/**
 * Fix Script: Unescape accidental backslash-escaped quotes introduced in Typography JSX
 * Scope: Only modifies files in src/ containing both `<Typography` and `variant=\"`
 * Action: Replace all occurrences of \" with " in those files.
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) acc.push(full);
  }
  return acc;
}

const root = join(process.cwd(), "src");
const files = walk(root);
let changed = 0;
let replacements = 0;
for (const f of files) {
  let src = readFileSync(f, "utf8");
  if (src.includes("<Typography") && src.includes('variant=\\"')) {
    const before = src;
    src = src.replace(/\\"/g, '"');
    if (src !== before) {
      writeFileSync(f, src, "utf8");
      changed++;
      const diffCount = (before.match(/\\"/g) || []).length;
      replacements += diffCount;
      console.log(`Fixed ${diffCount} escaped quotes in ${f}`);
    }
  }
}
console.log(
  `\nFix complete: ${changed} files updated; ${replacements} occurrences unescaped.`
);
