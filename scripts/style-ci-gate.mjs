#!/usr/bin/env node
/**
 * style-ci-gate.mjs
 * Lightweight style governance gate to prevent regressions after Phase A/B.
 * Fails (non‑zero exit) if:
 *  1. Any raw heading (h1–h4) using utility typography (text-2xl, font-bold, etc.) detected.
 *  2. Any "text-white" class usage (should use semantic text tokens or inverse surface).
 *  3. Any container-like raw bg-white / bg-gray-(50|100|200) usage lacking a semantic surface-* class.
 *     Heuristic: class string includes bg-(white|gray-50|gray-100|gray-200) AND (p-|px-|py-|shadow|border) AND NOT surface-(app|header|card|subtle|inverse|nav)
 *
 * On failure prints a concise report with file:line and offending snippet, then exits 1.
 * Otherwise prints PASS summary and exits 0.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname; // project root (scripts/..)
const SRC = join(ROOT, 'src');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out); else if (/\.(tsx?|jsx?)$/.test(e)) out.push(full);
  }
  return out;
}

const files = walk(SRC);

const headingRe = /<h([1-4])[^>]*className=\"([^\"]+)\"/g;
const issues = { headings: [], textWhite: [], rawSurfaces: [] };

for (const file of files) {
  const txt = readFileSync(file, 'utf8');
  // Capture className="..." blocks once to reduce repeated scanning cost
  const classRe = /class(Name)?=\"([^\"]+)\"/g;
  let m;
  // Headings
  while ((m = headingRe.exec(txt))) {
    const classes = m[2];
    if (/(text-[23]xl|text-xl|font-(bold|semibold))/.test(classes)) {
      const line = txt.slice(0, m.index).split(/\n/).length;
      issues.headings.push({ file: relative(ROOT, file), line, classes: classes.slice(0,140) });
    }
  }
  // Other class scans
  while ((m = classRe.exec(txt))) {
    const cls = m[2];
    if (cls.includes('text-white')) {
      const line = txt.slice(0, m.index).split(/\n/).length;
      issues.textWhite.push({ file: relative(ROOT, file), line, classes: cls.slice(0,140) });
    }
    if (/(bg-(white|gray-(50|100|200))\b)/.test(cls) && /(p-|px-|py-|shadow|border)/.test(cls) && !/surface-(app|header|card|subtle|inverse|nav)/.test(cls)) {
      const line = txt.slice(0, m.index).split(/\n/).length;
      issues.rawSurfaces.push({ file: relative(ROOT, file), line, classes: cls.slice(0,140) });
    }
  }
}

let failed = false;
function section(title, arr) {
  if (!arr.length) return; failed = true; console.log(`\n[FAIL] ${title} (${arr.length})`);
  for (const f of arr.slice(0, 40)) console.log(`  - ${f.file}:${f.line} :: ${f.classes}`);
  if (arr.length > 40) console.log(`  ... ${arr.length - 40} more`);
}

section('Raw utility headings (replace with <Typography>)', issues.headings);
section('text-white occurrences (use semantic text tokens)', issues.textWhite);
section('Raw bg-* surface containers lacking semantic surface-*', issues.rawSurfaces);

if (failed) {
  console.log(`\nStyle CI Gate: FAILED (headings=${issues.headings.length} text-white=${issues.textWhite.length} rawSurfaces=${issues.rawSurfaces.length})`);
  process.exit(1);
} else {
  console.log(`Style CI Gate: PASS (scanned ${files.length} files) – No regressions detected.`);
}
