#!/usr/bin/env tsx
/**
 * Codemod: Replace raw hover:text-gray-* utilities with semantic text tokens.
 *
 * Mapping Strategy:
 *  gray-700/800 -> text-primary
 *  gray-600     -> text-secondary
 *  gray-500/400 -> text-muted
 *  Dark mode variants map similarly (lighter shades collapse to same semantic buckets).
 *
 * This ONLY rewrites hover (and dark:hover) text color utilities inside /src excluding backup folders.
 * It leaves existing already-semantic classes untouched.
 *
 * Usage:
 *  tsx scripts/codemod-hover-text-gray-to-semantic.ts --dry-run   # report only
 *  tsx scripts/codemod-hover-text-gray-to-semantic.ts             # apply
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface ChangeRecord { file: string; before: string; after: string; occurrences: number; }

// Support ESM environment (no __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(projectRoot, 'src');
const DRY_RUN = process.argv.includes('--dry-run');

// Ordered mapping (longer / specific patterns first to avoid partial overlaps)
const replacements: [RegExp, string][] = [
  [/dark:hover:text-gray-800/g, 'dark:hover:text-text-primary'],
  [/dark:hover:text-gray-700/g, 'dark:hover:text-text-primary'],
  [/dark:hover:text-gray-600/g, 'dark:hover:text-text-secondary'],
  [/dark:hover:text-gray-500/g, 'dark:hover:text-text-muted'],
  [/dark:hover:text-gray-400/g, 'dark:hover:text-text-muted'],
  [/dark:hover:text-gray-300/g, 'dark:hover:text-text-secondary'],
  [/hover:text-gray-800/g, 'hover:text-text-primary'],
  [/hover:text-gray-700/g, 'hover:text-text-primary'],
  [/hover:text-gray-600/g, 'hover:text-text-secondary'],
  [/hover:text-gray-500/g, 'hover:text-text-muted'],
  [/hover:text-gray-400/g, 'hover:text-text-muted'],
];

const ignoredDirs = new Set([
  '.codemod-backups',
  'node_modules',
  'dist',
  'build',
  '.git'
]);

function walk(dir: string, collector: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (ignoredDirs.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, collector);
    } else if (e.isFile() && /\.(tsx|jsx|ts|js)$/.test(e.name)) {
      collector.push(full);
    }
  }
}

function apply(file: string): ChangeRecord | null {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  let occurrences = 0;
  for (const [regex, replacement] of replacements) {
    if (regex.test(after)) {
      const matchCount = (after.match(regex) || []).length;
      occurrences += matchCount;
      after = after.replace(regex, replacement);
    }
  }
  if (occurrences > 0 && before !== after) {
    if (!DRY_RUN) {
      fs.writeFileSync(file, after, 'utf8');
    }
    return { file: path.relative(projectRoot, file), before, after, occurrences };
  }
  return null;
}

(function main() {
  const files: string[] = [];
  walk(SRC_DIR, files);

  const changed: ChangeRecord[] = [];
  for (const f of files) {
    const rec = apply(f);
    if (rec) changed.push(rec);
  }

  if (changed.length === 0) {
    console.log('No raw hover gray text utilities found (or already converted).');
    return;
  }

  const totalOcc = changed.reduce((s, c) => s + c.occurrences, 0);
  console.log(`\nCodemod ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}: ${changed.length} files; ${totalOcc} occurrences.`);
  for (const c of changed) {
    console.log(` - ${c.file}: ${c.occurrences} replacements`);
  }

  // Simple summary diff snippet (first occurrence per file)
  if (DRY_RUN) {
    console.log('\nSample previews (first 3 files):');
    changed.slice(0, 3).forEach((c) => {
      const linesBefore = c.before.split(/\n/);
      const linesAfter = c.after.split(/\n/);
      for (let i = 0; i < linesBefore.length; i++) {
        if (linesBefore[i] !== linesAfter[i] && /hover:text-/.test(linesBefore[i])) {
          console.log(`\nFile: ${c.file}\n- ${linesBefore[i].trim()}\n+ ${linesAfter[i].trim()}`);
          break;
        }
      }
    });
  }

  if (!DRY_RUN) {
    console.log('\nNext Steps:');
    console.log('1. Run grep to confirm zero remaining raw hover utilities.');
    console.log('2. Run lint & tests.');
    console.log('3. Commit with chore(design): semantic hover text codemod.');
  }
})();
