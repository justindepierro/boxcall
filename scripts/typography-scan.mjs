#!/usr/bin/env node
/**
 * typography-scan.mjs
 * Audit headings (h1–h4) still using raw utility stacks instead of <Typography>.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(e)) out.push(full);
  }
  return out;
}
const files = walk(SRC);
const findings = [];
const headingRe = /<h([1-4])[^>]*className=\"([^\"]+)\"/g;
for (const file of files) {
  const txt = readFileSync(file, "utf8");
  let m;
  while ((m = headingRe.exec(txt))) {
    const cls = m[2];
    if (/(text-[23]xl|text-xl|font-(semibold|bold))/.test(cls)) {
      const line = txt.slice(0, m.index).split(/\n/).length;
      findings.push({
        file: relative(ROOT, file),
        line,
        level: m[1],
        classes: cls.slice(0, 160),
      });
    }
  }
}
console.log(`Found ${findings.length} heading utility candidates.`);
for (const f of findings.slice(0, 80)) {
  console.log(`${f.file}:${f.line} <h${f.level}> ${f.classes}`);
}
if (findings.length) console.log("\nNext: map each to <Typography variant>.");
