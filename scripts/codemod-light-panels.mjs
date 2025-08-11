#!/usr/bin/env node
/** Codemod: replace raw light color panels (bg-*-50 + border-*-200) with semantic surface classes */
import { globby } from 'globby';
import fs from 'node:fs';

const DRY = process.argv.includes('--dry');
const FILES = await globby(['src/**/*.{ts,tsx,jsx}']);
const PANEL_BG = /bg-(?:blue|jade|orange|yellow|green|purple|slate|red|amber|pink|indigo)-50/g;
const PANEL_BORDER = /border-(?:blue|jade|orange|yellow|green|purple|slate|red|amber|pink|indigo)-200/g;
let modified = 0;
for (const file of FILES) {
  let src = fs.readFileSync(file,'utf8');
  const orig = src;
  src = src.replace(PANEL_BG,'surface-subtle').replace(PANEL_BORDER,'border-subtle');
  if (src !== orig) {
    modified++;
    if (!DRY) fs.writeFileSync(file,src);
    console.log(`[codemod-light-panels] Updated ${file}`);
  }
}
console.log(`[codemod-light-panels] ${modified} file(s) ${DRY? 'would be ':''}modified.`);
