#!/usr/bin/env node
/**
 * Codemod: Replace legacy raw tooltip containers (bg-gray-900 + text-white) with surface-inverse.
 * Heuristic targets spans/divs having both bg-gray-900 & text-white and role="tooltip".
 * Adds surface-inverse and removes bg-gray-900 text-white tokens.
 * Usage: node scripts/codemod-tooltip-bg.mjs [--dry]
 */
import { globby } from 'globby';
import fs from 'fs';

const DRY = process.argv.includes('--dry');

(async function run(){
  const files = await globby(['src/**/*.{ts,tsx}']);
  let changed = 0;
  for (const f of files) {
    let src = fs.readFileSync(f,'utf8');
    if(!/role=\"tooltip\"/.test(src)) continue;
    const before = src;
    src = src.replace(/className=\"([^\"]*?)\"/g,(full,cls)=>{
      if(/role=\"tooltip\"/.test(src) && /bg-gray-900/.test(cls) && /text-white/.test(cls)){
        let tokens = cls.split(/\s+/).filter(Boolean);
        tokens = tokens.filter(t=>t!== 'bg-gray-900' && t!== 'text-white');
        if(!tokens.includes('surface-inverse')) tokens.push('surface-inverse');
        return `className="${Array.from(new Set(tokens)).join(' ')}"`;
      }
      return full;
    });
    if(src!==before){
      changed++;
      if(!DRY) fs.writeFileSync(f,src,'utf8');
    }
  }
  console.log(`Tooltip bg codemod complete. Files changed: ${changed}`);
  if(DRY) console.log('Dry run only.');
})().catch(e=>{console.error(e);process.exit(1);});
