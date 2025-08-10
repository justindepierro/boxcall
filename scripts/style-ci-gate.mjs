#!/usr/bin/env node
/**
 * style-ci-gate.mjs
 * Tightened style governance gate.
 * Hard fails on:
 *  - Raw utility headings (h1–h4) using direct utility sizing/weight instead of <Typography>
 *  - text-white usages (should use semantic inverse tokens)
 *  - Raw gray surface utilities (bg-gray-50/100/200, border-gray-100/200)
 *  - Raw gray text utilities (text-gray-500..900)
 *  - Inline legacy pill patterns
 * Soft-gates legacy bg-white containers against baseline (no growth / new occurrences)
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  existsSync,
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
const headingRe = /<h([1-4])[^>]*className=\"([^\"]+)\"/g;

const issues = {
  headings: [],
  textWhite: [],
  rawSurfaces: [],
  inlinePills: [],
  rawGraySurfaces: [],
  rawGrayText: [],
};

for (const file of files) {
  const txt = readFileSync(file, "utf8");
  const classRe = /class(Name)?=\"([^\"]+)\"/g;
  let m;
  while ((m = headingRe.exec(txt))) {
    const classes = m[2];
    if (/(text-[23]xl|text-xl|font-(bold|semibold))/.test(classes)) {
      const line = txt.slice(0, m.index).split(/\n/).length;
      issues.headings.push({
        file: relative(ROOT, file),
        line,
        classes: classes.slice(0, 140),
      });
    }
  }
  while ((m = classRe.exec(txt))) {
    const cls = m[2];
    const line = txt.slice(0, m.index).split(/\n/).length;
    if (cls.includes("text-white")) {
      issues.textWhite.push({
        file: relative(ROOT, file),
        line,
        classes: cls.slice(0, 140),
      });
    }
    const hasRawWhiteOrGraySurface =
      /(bg-(white|gray-(50|100|200))\b)/.test(cls) &&
      /(p-|px-|py-|shadow|border)/.test(cls) &&
      !/surface-(app|header|card|subtle|inverse|nav)/.test(cls);
    if (hasRawWhiteOrGraySurface) {
      issues.rawSurfaces.push({
        file: relative(ROOT, file),
        line,
        classes: cls.slice(0, 140),
      });
    }
    if (/(bg-gray-(50|100|200)\b|border-gray-(100|200)\b)/.test(cls)) {
      issues.rawGraySurfaces.push({
        file: relative(ROOT, file),
        line,
        classes: cls.slice(0, 140),
      });
    }
    if (/(^|\s)text-gray-(500|600|700|800|900)(\s|$)/.test(cls)) {
      issues.rawGrayText.push({
        file: relative(ROOT, file),
        line,
        classes: cls.slice(0, 140),
      });
    }
    if (
      /rounded-full/.test(cls) &&
      /px-2|px-3/.test(cls) &&
      /bg-[a-z]+-100/.test(cls) &&
      /text-[a-z]+-800/.test(cls)
    ) {
      issues.inlinePills.push({
        file: relative(ROOT, file),
        line,
        classes: cls.slice(0, 140),
      });
    }
  }
}

// Baseline support
const BASELINE_PATH = join(ROOT, "scripts/style-ci-baseline.json");
let baseline;
if (existsSync(BASELINE_PATH)) {
  try {
    baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    baseline = null;
  }
}
const currentRawSurfaceKeys = issues.rawSurfaces.map(
  (r) => `${r.file}:${r.line}::${r.classes}`
);
if (!baseline) {
  baseline = {
    rawSurfaces: {
      count: currentRawSurfaceKeys.length,
      entries: currentRawSurfaceKeys,
    },
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
  console.log(
    `Created baseline at scripts/style-ci-baseline.json (rawSurfaces=${baseline.rawSurfaces.count}). Commit this file.`
  );
}

let failed = false;
function hardFailSection(title, arr) {
  if (!arr.length) return;
  failed = true;
  console.log(`\n[FAIL] ${title} (${arr.length})`);
  for (const f of arr.slice(0, 40))
    console.log(`  - ${f.file}:${f.line} :: ${f.classes}`);
  if (arr.length > 40) console.log(`  ... ${arr.length - 40} more`);
}

// Hard gates
hardFailSection(
  "Raw utility headings (replace with <Typography>)",
  issues.headings
);
hardFailSection(
  "text-white occurrences (use semantic text tokens)",
  issues.textWhite
);
hardFailSection(
  "Raw gray surface utilities (bg-gray-50/100/200, border-gray-100/200)",
  issues.rawGraySurfaces
);
hardFailSection(
  "Raw gray text utilities (text-gray-500/600/700/800/900)",
  issues.rawGrayText
);
hardFailSection("Inline pill styles (replace with <Tag>)", issues.inlinePills);

// Soft gate baseline (legacy bg-white containers only)
const baselineFilteredEntries = (baseline.rawSurfaces?.entries || []).filter(
  (e) => !/bg-gray-(50|100|200)|border-gray-(100|200)/.test(e)
);
const baselineSet = new Set(baselineFilteredEntries);
const baselineFilteredCount = baselineFilteredEntries.length;
const filteredCurrent = currentRawSurfaceKeys.filter(
  (k) => !/bg-gray-(50|100|200)|border-gray-(100|200)/.test(k)
);
const newRawSurfaceEntries = filteredCurrent.filter((k) => !baselineSet.has(k));
const rawSurfaceCountGrowth = filteredCurrent.length > baselineFilteredCount;
if (newRawSurfaceEntries.length || rawSurfaceCountGrowth) {
  failed = true;
  console.log(
    `\n[FAIL] Raw bg-* surface containers regression (baseline=${baselineFilteredCount} current=${filteredCurrent.length} new=${newRawSurfaceEntries.length})`
  );
  for (const k of newRawSurfaceEntries.slice(0, 40)) console.log(`  + ${k}`);
  if (newRawSurfaceEntries.length > 40)
    console.log(`  ... ${newRawSurfaceEntries.length - 40} more new entries`);
} else {
  console.log(
    `Raw surface containers: OK (baseline=${baselineFilteredCount}, current=${filteredCurrent.length})`
  );
}

if (process.env.STYLE_CI_UPDATE_BASELINE === "1") {
  baseline.rawSurfaces = {
    count: currentRawSurfaceKeys.length,
    entries: currentRawSurfaceKeys,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
  console.log("Baseline updated via STYLE_CI_UPDATE_BASELINE=1");
}

if (failed) {
  console.log(
    `\nStyle CI Gate: FAILED (headings=${issues.headings.length} text-white=${issues.textWhite.length} rawGraySurf=${issues.rawGraySurfaces.length} rawGrayText=${issues.rawGrayText.length})`
  );
  process.exit(1);
}
console.log(`Style CI Gate: PASS (scanned ${files.length} files)`);
