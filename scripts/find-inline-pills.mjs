#!/usr/bin/env node
/**
 * find-inline-pills.mjs
 * Scan for inline pill/tag patterns (px-2/px-2.5 + py-0.5/py-1 + rounded-full + text-xs) not using <Badge> or <Tag>.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

function walk(dir, out=[]) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    const st = statSync(f);
    if (st.isDirectory()) walk(f, out); else if (/\.(tsx?|jsx?)$/.test(e)) out.push(f);
  }
  return out;
}

const files = walk(SRC);
const results = [];
const pillRegex = /className=\"([^\"]*(px-2(\.5)?|px-3)[^\"]*(py-0\.5|py-1)[^\"]*rounded-full[^\"]*)\"/g;

for (const file of files) {
  const txt = readFileSync(file, 'utf8');
  if (txt.includes('<Badge') || txt.includes('<Tag')) continue; // ignore files already using primitives
  let m;
  while ((m = pillRegex.exec(txt))) {
    const cls = m[1];
    const line = txt.slice(0, m.index).split(/\n/).length;
    results.push({ file: relative(ROOT, file), line, className: cls.slice(0,160) });
  }
}

console.log(`Found ${results.length} inline pill candidates.`);
for (const r of results.slice(0,120)) console.log(`${r.file}:${r.line} :: ${r.className}`);
if (results.length) console.log('\nNext: Replace with <Tag variant=...> or <Badge variant=...>.');
