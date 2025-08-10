#!/usr/bin/env node
/**
 * scripts/style-audit.mjs
 * Lightweight style usage audit (Phase 2) – scans src/ for selected Tailwind utility patterns:
 *  - text-white occurrences and context (line, file)
 *  - bg-* color utilities (counts)
 *  - brand semantic class usage (bg-brand-jade, text-brand-jade-dark, etc.)
 *  - button primitive vs raw <button> fallback count (simple heuristic)
 *
 * Outputs JSON + Markdown summary under docs/style-inventory/
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { relative, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

const files = walk(SRC);

const metrics = {
  totalFiles: files.length,
  textWhite: 0,
  textWhiteEntries: [],
  bgClasses: {},
  brandClasses: {},
  rawButtonHeuristic: 0,
  surfaceCandidates: [],
  whiteOnWhiteInteractions: [],
};

const brandPatterns = [
  "brand-jade",
  "brand-jade-dark",
  "brand-jade-light",
  "brand-navy",
  "brand-navy-dark",
  "interaction-jade",
  "surface-jade",
  "surface-jade-dark",
];

const bgRegex = /\bbg-([a-zA-Z0-9-\/]+)/g; // captures tailwind bg-* tokens

for (const file of files) {
  const content = readFileSync(file, "utf8");
  // text-white occurrences
  const twMatches = [...content.matchAll(/class(Name)?=\"([^\"]*)\"/g)];
  for (const m of twMatches) {
    const cls = m[2];
    if (cls.includes("text-white")) {
      metrics.textWhite++;
      // get line number
      const upto = content.slice(0, m.index);
      const line = upto.split(/\n/).length;
      metrics.textWhiteEntries.push({
        file: relative(ROOT, file),
        line,
        className: cls.slice(0, 140),
      });
    }
    let b;
    while ((b = bgRegex.exec(cls))) {
      const key = b[1];
      metrics.bgClasses[key] = (metrics.bgClasses[key] || 0) + 1;
    }
    for (const bp of brandPatterns) {
      if (cls.includes(bp))
        metrics.brandClasses[bp] = (metrics.brandClasses[bp] || 0) + 1;
    }
    // Surface candidate detection: bg-white / bg-gray-50/100/200 used on containers lacking semantic surface-* class
    if (
      /\bbg-(white|gray-(50|100|200))\b/.test(cls) &&
      !/surface-(card|subtle|raised|jade)/.test(cls)
    ) {
      // heuristic: consider if class string also has padding or shadow or border (container-like)
      if (/(p-|px-|py-|shadow|border)/.test(cls)) {
        const upto = content.slice(0, m.index);
        const line = upto.split(/\n/).length;
        metrics.surfaceCandidates.push({
          file: relative(ROOT, file),
          line,
          className: cls.slice(0, 140),
        });
      }
    }

    // White-on-white interaction detection
    // Heuristic: button-like element (inline-flex + focus ring or variant markers) inside white/gray-50 surface without contrasting hover/background
    const isGhostyButton = /inline-flex/.test(cls) && /focus:ring/.test(cls) && /btn|Button|variant|hover:/.test(cls);
    const transparentBg = !/\bbg-/.test(cls) || /bg-transparent/.test(cls);
    const lacksHoverBg = !/hover:bg-/.test(cls) && !/hover:surface-/.test(cls);
    // Look backwards a little for container context
    if (isGhostyButton && transparentBg && lacksHoverBg) {
      const contextSnippet = content.slice(Math.max(0, m.index - 400), m.index + cls.length + 50);
      if (/bg-(white|gray-50)/.test(contextSnippet) || /surface-card/.test(contextSnippet)) {
        // Ensure no immediate border/shadow giving separation
        if (!/border(-[a-z0-9-]+)?\s/.test(cls) && !/shadow/.test(cls)) {
          const upto = content.slice(0, m.index);
            const line = upto.split(/\n/).length;
            metrics.whiteOnWhiteInteractions.push({
              file: relative(ROOT, file),
              line,
              className: cls.slice(0,120),
            });
        }
      }
    }
  }
  // raw <button ...> heuristic (exclude Button.tsx and IconButton)
  const rawBtnMatches = content.match(/<button(?![^>]*role=)/g);
  if (
    rawBtnMatches &&
    !file.includes("Button.tsx") &&
    !file.includes("IconButton")
  ) {
    metrics.rawButtonHeuristic += rawBtnMatches.length;
  }
}

// Sort bg classes by count desc
const sortedBg = Object.entries(metrics.bgClasses).sort((a, b) => b[1] - a[1]);
const sortedBrand = Object.entries(metrics.brandClasses).sort(
  (a, b) => b[1] - a[1]
);

const outDir = join(ROOT, "docs/style-inventory");
mkdirSync(outDir, { recursive: true });

const jsonPath = join(outDir, "style-audit.json");
writeFileSync(
  jsonPath,
  JSON.stringify(
    { ...metrics, bgClasses: sortedBg, brandClasses: sortedBrand },
    null,
    2
  )
);

function table(rows, headers) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  return [head, sep, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

const mdLines = [];
mdLines.push("# Style Audit Summary");
mdLines.push(`Generated: ${new Date().toISOString()}`);
mdLines.push("\n## Key Metrics");
mdLines.push(
  table(
    [
      ["Total Source Files", String(metrics.totalFiles)],
      ["text-white Occurrences", String(metrics.textWhite)],
      [
        "Raw <button> Heuristic (non-primitive)",
        String(metrics.rawButtonHeuristic),
      ],
    ],
    ["Metric", "Value"]
  )
);

mdLines.push("\n## Top Background Classes");
mdLines.push(
  table(
    sortedBg.slice(0, 25).map(([k, v]) => [k, String(v)]),
    ["bg-*", "Count"]
  )
);

mdLines.push("\n## Brand Class Utilization");
mdLines.push(
  table(
    sortedBrand.map(([k, v]) => [k, String(v)]),
    ["Brand Token Class", "Count"]
  )
);

mdLines.push("\n## Sample text-white Locations (first 25)");
mdLines.push(
  table(
    metrics.textWhiteEntries
      .slice(0, 25)
      .map((e) => [e.file + ":" + e.line, "`" + e.className + "`"]),
    ["File:Line", "ClassName Snip"]
  )
);

mdLines.push("\n## Surface Class Remediation Candidates (first 25)");
mdLines.push(
  table(
    metrics.surfaceCandidates
      .slice(0, 25)
      .map((e) => [e.file + ":" + e.line, "`" + e.className + "`"]),
    ["File:Line", "ClassName Snip"]
  )
);

mdLines.push("\n## White-on-White Interaction Candidates (first 25)");
mdLines.push(
  table(
    metrics.whiteOnWhiteInteractions
      .slice(0, 25)
      .map((e) => [e.file + ":" + e.line, "`" + e.className + "`"]),
    ["File:Line", "ClassName Snip"]
  )
);

const mdPath = join(outDir, "style-audit.md");
writeFileSync(mdPath, mdLines.join("\n"));

console.log("Style audit complete");
console.log(` text-white: ${metrics.textWhite}`);
console.log(` raw <button> heuristic: ${metrics.rawButtonHeuristic}`);
console.log(` Report: ${relative(ROOT, mdPath)}`);
