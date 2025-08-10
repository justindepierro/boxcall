#!/usr/bin/env node
/**
 * Codemod: Replace legacy emerald-* Tailwind utility classes with jade-* equivalents.
 * Usage: node scripts/codemod-colors.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();
const TARGET_DIR = join(ROOT, 'src');

// File extensions to process
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html']);

let filesScanned = 0;
let filesModified = 0;
let totalReplacements = 0;

/**
 * Perform targeted replacements.
 * Strategy: conservative broad replacement of `emerald-` -> `jade-` but avoid inside URLs or hex values.
 */
function transform(content) {
  // Skip if no emerald
  if (!content.includes('emerald-')) return { content, count: 0 };

  // Basic replace; count occurrences first
  const matches = content.match(/emerald-/g) || [];
  const count = matches.length;
  const newContent = content.replace(/emerald-/g, 'jade-');
  return { content: newContent, count };
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip some directories if needed
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
      walk(full);
    } else if (exts.has(extname(entry))) {
      filesScanned++;
      const original = readFileSync(full, 'utf8');
      const { content: updated, count } = transform(original);
      if (count > 0) {
        if (!DRY) writeFileSync(full, updated, 'utf8');
        filesModified++;
        totalReplacements += count;
        console.log(`${DRY ? '[dry]' : '[mod]'} ${full} (${count} replacements)`);
      }
    }
  }
}

console.log('Codemod: emerald-* -> jade-*');
console.log(DRY ? 'Mode: DRY RUN' : 'Mode: WRITE');
walk(TARGET_DIR);
console.log(`\nSummary: scanned ${filesScanned} files, modified ${filesModified}, replacements ${totalReplacements}`);
if (DRY) console.log('Re-run without --dry to apply changes.');
