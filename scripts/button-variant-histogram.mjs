#!/usr/bin/env node
/**
 * button-variant-histogram.mjs
 * Scans src/ for <Button ... variant="..."> usages and emits a JSON + table histogram.
 * Intended to integrate into style-audit / style:gate for drift detection.
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
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
const variantCounts = {};
const variantRegex =
  /<Button[^>]*variant={(?:"([^"]+)"|'([^']+)')|<Button[^>]*variant=\"([^\"]+)\"/g;

for (const file of files) {
  const txt = readFileSync(file, "utf8");
  const re = /<Button[^>]*variant=\"([a-zA-Z0-9]+)\"/g; // simpler reliable pass
  let m;
  while ((m = re.exec(txt))) {
    const v = m[1];
    variantCounts[v] = (variantCounts[v] || 0) + 1;
  }
}

const outDir = join(ROOT, "docs/style-inventory");
try {
  mkdirSync(outDir, { recursive: true });
} catch {}

const data = { generatedAt: new Date().toISOString(), variantCounts };
writeFileSync(
  join(outDir, "button-variant-histogram.json"),
  JSON.stringify(data, null, 2)
);

// Markdown table
const rows = Object.entries(variantCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([v, c]) => `| ${v} | ${c} |`)
  .join("\n");
const md = `# Button Variant Histogram\n\nGenerated ${data.generatedAt}\n\n| Variant | Count |\n| ------- | ----- |\n${rows || "| (none) | 0 |"}\n`;
writeFileSync(join(outDir, "button-variant-histogram.md"), md);

console.log(
  "[button-variant-histogram] Generated counts for",
  Object.keys(variantCounts).length,
  "variants"
);
