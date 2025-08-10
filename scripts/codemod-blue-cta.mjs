#!/usr/bin/env node
/**
 * Codemod: Replace strong blue CTA background utilities with jade equivalents (Phase 0 consolidation)
 * Targets ONLY high-emphasis action patterns: bg-blue-500 / bg-blue-600 (+ hover / active / border / ring variants)
 * Leaves informational / category tints (blue-50/100/200 etc.) untouched.
 * Usage: node scripts/codemod-blue-cta.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const DRY = process.argv.includes('--dry');
const exts = new Set(['.tsx', '.ts', '.jsx', '.js']);
const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const replacements = [
  [/\bbg-blue-600\b/g, 'bg-jade-600'],
  [/\bbg-blue-500\b/g, 'bg-jade-600'], // unify to jade-600 base
  [/\bhover:bg-blue-700\b/g, 'hover:bg-jade-700'],
  [/\bhover:bg-blue-600\b/g, 'hover:bg-jade-700'],
  [/\bactive:bg-blue-700\b/g, 'active:bg-jade-700'],
  [/\bborder-blue-600\b/g, 'border-jade-600'],
  [/\bborder-blue-500\b/g, 'border-jade-600'],
  [/\bfocus:ring-blue-500\b/g, 'focus:ring-jade-500'],
  [/\bring-blue-500\b/g, 'ring-jade-500'],
  [/\btext-blue-600\b(?=[^\n]*bg-blue-6)/g, 'text-jade-600'], // rare pattern where both appear
];

let filesScanned = 0;
let filesModified = 0;
let total = 0;

function transform(content){
  let count = 0;
  for(const [pattern, repl] of replacements){
    if(pattern.test(content)){
      content = content.replace(pattern, ()=>{count++; return repl;});
    }
  }
  return {content, count};
}

function walk(dir){
  for(const entry of readdirSync(dir)){
    const full = join(dir, entry);
    const st = statSync(full);
    if(st.isDirectory()){
      if(['node_modules','dist','.git'].includes(entry)) continue;
      walk(full);
    } else if(exts.has(extname(entry))){
      filesScanned++;
      let text = readFileSync(full,'utf8');
      const {content, count} = transform(text);
      if(count>0){
        if(!DRY) writeFileSync(full, content, 'utf8');
        filesModified++;
        total += count;
        console.log(`${DRY?'[dry]':'[mod]'} ${full} (${count})`);
      }
    }
  }
}

console.log('Codemod: blue CTA -> jade primary');
console.log(DRY?'Mode: DRY':'Mode: WRITE');
walk(SRC);
console.log(`Summary: scanned ${filesScanned} files; modified ${filesModified}; replacements ${total}`);
if(DRY) console.log('Re-run without --dry to apply changes.');
