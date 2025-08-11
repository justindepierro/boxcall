#!/usr/bin/env node
/**
 * Contrast Inventory Script
 * Scans src/ for utility class patterns likely to produce low contrast or ad-hoc light surface usage
 * Outputs JSON + markdown summary to stdout.
 */
import { globby } from "globby";
import fs from "node:fs";

const LIGHT_BG_REGEX = /(bg-(?:white|[a-z-]+-(?:50|100|200)))(?![\w-])/g; // light backgrounds
const WHITE_TEXT_REGEX = /text-white(?![\w-])/g;
const MID_BG_WHITE_TEXT =
  /(bg-(?:red|yellow|orange|amber|emerald|green|lime|blue|indigo|purple|violet|pink|rose|jade|navy)-(?:500))[^\n]*text-white/g;
const LIGHT_BG_BUTTON_PATTERN =
  /<(Button|a)\b[^>]*className="[^"]*(bg-(?:[a-z-]+-(?:50|100|200)))[^"]*(?:\btext-[a-z-]+-700)?[^"]*"/g;

const FILE_GLOB = ["src/**/*.{ts,tsx,jsx}"];

function collectMatches(source, regex) {
  regex.lastIndex = 0;
  const matches = [];
  let m;
  while ((m = regex.exec(source))) {
    matches.push({ index: m.index, match: m[0] });
  }
  return matches;
}

const results = [];
const summary = {
  lightBgCount: 0,
  whiteTextOnLight: 0,
  midToneWhite: 0,
  lightBgButtons: 0,
};

const files = await globby(FILE_GLOB);
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const lightBg = collectMatches(text, LIGHT_BG_REGEX);
  const whiteText = collectMatches(text, WHITE_TEXT_REGEX);
  const midTone = collectMatches(text, MID_BG_WHITE_TEXT);
  const lightBgButtons = collectMatches(text, LIGHT_BG_BUTTON_PATTERN);

  // Heuristic: white text within 120 chars of light background in same file
  let whiteOnLightPairs = 0;
  for (const w of whiteText) {
    if (lightBg.some((l) => Math.abs(l.index - w.index) < 120))
      whiteOnLightPairs++;
  }

  if (
    lightBg.length ||
    whiteOnLightPairs ||
    midTone.length ||
    lightBgButtons.length
  ) {
    results.push({
      file,
      lightBg: lightBg.map((m) => m.match).slice(0, 50),
      whiteOnLightPairs,
      midToneWhite: midTone.map((m) => m.match).slice(0, 50),
      lightBgButtons: lightBgButtons.map((m) => m.match).slice(0, 50),
    });
  }

  summary.lightBgCount += lightBg.length;
  summary.whiteTextOnLight += whiteOnLightPairs;
  summary.midToneWhite += midTone.length;
  summary.lightBgButtons += lightBgButtons.length;
}

const mdLines = [];
mdLines.push("# Contrast Inventory Report");
mdLines.push("");
mdLines.push(`Scanned files: ${files.length}`);
mdLines.push("");
mdLines.push("## Summary");
mdLines.push("| Metric | Count |");
mdLines.push("|--------|-------|");
mdLines.push(
  `| Light background utility occurrences | ${summary.lightBgCount} |`
);
mdLines.push(
  `| White text near light background (heuristic) | ${summary.whiteTextOnLight} |`
);
mdLines.push(`| Mid-tone (500) bg with white text | ${summary.midToneWhite} |`);
mdLines.push(
  `| Light background button patterns | ${summary.lightBgButtons} |`
);
mdLines.push("");
mdLines.push("## Files");
for (const r of results) {
  mdLines.push(`### ${r.file}`);
  if (r.lightBg.length)
    mdLines.push(
      `- Light BG samples: ${[...new Set(r.lightBg)].slice(0, 8).join(", ")}`
    );
  if (r.whiteOnLightPairs)
    mdLines.push(`- White text near light bg pairs: ${r.whiteOnLightPairs}`);
  if (r.midToneWhite.length)
    mdLines.push(`- Mid-tone bg + white: ${r.midToneWhite.length}`);
  if (r.lightBgButtons.length)
    mdLines.push(
      `- Light background button patterns: ${r.lightBgButtons.length}`
    );
  mdLines.push("");
}

const report = { summary, results };

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(mdLines.join("\n"));
}

// Exit with non-zero if midToneWhite or whiteOnLightPairs exceed threshold (for CI gate later)
if (process.argv.includes("--gate")) {
  const FAIL = summary.midToneWhite > 0 || summary.whiteTextOnLight > 0;
  if (FAIL) process.exit(2);
}
