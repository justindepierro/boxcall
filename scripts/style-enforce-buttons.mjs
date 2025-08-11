#!/usr/bin/env node
/**
 * Button Style Enforcement Script
 * Detects inline utility color overrides on <Button> usage to encourage variant-driven styling.
 */
import { globby } from "globby";
import fs from "node:fs";

const FILES = await globby(["src/**/*.{ts,tsx,jsx}"]);
const IGNORE = [/visual\//];
const COLOR_UTILITY =
  /(bg|text|border)-(?:red|green|blue|yellow|orange|amber|purple|violet|pink|jade|navy|slate|gray)-(?:50|100|200|300|400|500|600|700|800|900)/;
const findings = [];
for (const file of FILES) {
  if (IGNORE.some((r) => r.test(file))) continue;
  const src = fs.readFileSync(file, "utf8");
  const buttonTag = /<Button(.*?)>/gs;
  let m;
  while ((m = buttonTag.exec(src))) {
    const content = m[1];
    const classAttr = /className="([^"]+)"/.exec(content);
    if (classAttr) {
      const classes = classAttr[1];
      if (COLOR_UTILITY.test(classes)) {
        findings.push({ file, classes });
      }
    }
  }
}
if (findings.length) {
  console.log("[style-enforce-buttons] Offending inline color overrides:");
  for (const f of findings) console.log(`- ${f.file}: ${f.classes}`);
  process.exit(2);
} else {
  console.log("[style-enforce-buttons] OK");
}
