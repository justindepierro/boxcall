#!/usr/bin/env node
/**
 * Heuristic scanner: find potential white-on-light contrast risks.
 * Looks for className/ class attributes containing `text-white` without an obviously dark background utility in the SAME attribute.
 * This is a static approximation; manual review required.
 */
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const exts = new Set([".tsx", ".ts", ".jsx", ".js", ".html"]);

// Dark background patterns considered safe when paired with white text
const DARK_BG_PATTERNS = [
  /bg-(jade|navy|gray|slate|red|error|success|warning|confidence)-(5|6|7|8|9)00?/,
  /bg-(jade|navy|gray|slate|error|success|warning|confidence)-(600|700|800|900)/,
  /bg-(black|zinc|neutral|stone)-[6-9]00/,
  /bg-gradient/,
  /dark:bg-gray-800/,
];

function isTextWhiteLine(line) {
  return line.includes("text-white");
}

function hasDarkBg(line) {
  return DARK_BG_PATTERNS.some((r) => r.test(line));
}

let findings = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(entry)) continue;
      walk(full);
    } else if (exts.has(entry.slice(entry.lastIndexOf(".")))) {
      const content = readFileSync(full, "utf8").split(/\n/);
      content.forEach((line, idx) => {
        if (isTextWhiteLine(line) && !hasDarkBg(line)) {
          findings.push({
            file: full,
            line: idx + 1,
            snippet: line.trim().slice(0, 180),
          });
        }
      });
    }
  }
}
walk(SRC);
console.log(
  JSON.stringify(
    { potentialRisks: findings.slice(0, 200), total: findings.length },
    null,
    2
  )
);
if (findings.length) {
  console.error(
    `Found ${findings.length} potential white-on-light risks (heuristic).`
  );
} else {
  console.log(
    "No heuristic risks detected (likely all text-white have dark backgrounds or need deeper DOM context)."
  );
}
