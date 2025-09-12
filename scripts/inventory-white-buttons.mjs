#!/usr/bin/env node
/**
 * inventory-white-buttons.mjs
 * Finds <Button ...> usages whose className contains bg-white (direct white background override).
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
const hits = [];

for (const file of files) {
  const txt = readFileSync(file, "utf8");
  // crude split into potential button declaration blocks
  const regex = /<Button[\s\S]*?>/g; // opening tag only
  let m;
  while ((m = regex.exec(txt))) {
    const tag = m[0];
    if (/className=\"[^\"]*bg-white/.test(tag)) {
      const upto = txt.slice(0, m.index);
      const line = upto.split(/\n/).length;
      hits.push({
        file: relative(ROOT, file),
        line,
        snippet: tag.slice(0, 160),
      });
    }
  }
}

console.log(JSON.stringify({ total: hits.length, hits }, null, 2));
