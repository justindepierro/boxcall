#!/usr/bin/env node
// Performance budget verification against baseline/performance-budgets.json
// Budgets tracked:
//  - largestNonPdfChunkGzipTarget: largest single non-pdf JS chunk (gzip bytes)
//  - initialJsGzipTarget: combined gzip size of initial entry JS (index-*.js + vendor-*.js)
// Exits with code 1 if any budget exceeded.

import fs from "fs";
import path from "path";
import { gzipSync } from "zlib";

function log(msg) {
  console.log(`[perf-budgets] ${msg}`);
}
function fail(msg) {
  console.error(`❌ [perf-budgets] ${msg}`);
  process.exitCode = 1;
}

const root = process.cwd();
const baselineFile = path.join(root, "baseline", "performance-budgets.json");
if (!fs.existsSync(baselineFile)) {
  log("No baseline/performance-budgets.json found. Skipping (treat as pass).");
  process.exit(0);
}

const distAssetsDir = path.join(root, "dist", "assets");
if (!fs.existsSync(distAssetsDir)) {
  fail("dist/assets directory missing. Run build first.");
  process.exit(1);
}

const budgets = JSON.parse(fs.readFileSync(baselineFile, "utf8")).budgets || {};
const files = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith(".js"));

// Exclude patterns for heavy, optional PDF-related chunks from the "largestNonPdf" calc
// This covers common names we use (pdfRenderer, LazyPDFExport, PracticeScriptPDFService, pdfCapture)
const EXCLUDE_FROM_NON_PDF = [
  /(^|-)pdf/i,
  /pdfrenderer/i,
  /pdfcapture/i,
  /lazypdfexport/i,
  /practicescriptpdfservice/i,
];

function gzipSize(filePath) {
  const raw = fs.readFileSync(filePath);
  const gz = gzipSync(raw, { level: 9 });
  return gz.length;
}

// Largest non-pdf chunk
let largestNonPdf = { file: null, size: 0 };
for (const f of files) {
  // exclude heavy pdf-related bundles from this metric
  if (EXCLUDE_FROM_NON_PDF.some((re) => re.test(f))) continue;
  const full = path.join(distAssetsDir, f);
  const size = gzipSize(full);
  if (size > largestNonPdf.size) largestNonPdf = { file: f, size };
}

// Initial JS: assume index-* + vendor-* comprise initial critical path
const initialJsFiles = files.filter((f) => /^(index|vendor)-.+\.js$/.test(f));
const initialTotal = initialJsFiles.reduce(
  (sum, f) => sum + gzipSize(path.join(distAssetsDir, f)),
  0
);

if (largestNonPdf.file) {
  log(
    `Largest non-pdf chunk gzip: ${largestNonPdf.size} bytes (${largestNonPdf.file})`
  );
} else {
  log("Largest non-pdf chunk gzip: N/A (no matching files)");
}
log(
  `Initial JS (index/vendor) total gzip: ${initialTotal} bytes [${initialJsFiles.join(", ")}]`
);

if (
  budgets.largestNonPdfChunkGzipTarget &&
  largestNonPdf.size > budgets.largestNonPdfChunkGzipTarget
) {
  fail(
    `Largest non-pdf chunk exceeded budget: ${largestNonPdf.size} > ${budgets.largestNonPdfChunkGzipTarget}`
  );
}
if (budgets.initialJsGzipTarget && initialTotal > budgets.initialJsGzipTarget) {
  fail(
    `Initial JS exceeded budget: ${initialTotal} > ${budgets.initialJsGzipTarget}`
  );
}

if (process.exitCode === 1) {
  console.error("\nBudget failure details saved to perf-budget-report.json");
  fs.writeFileSync(
    path.join(root, "perf-budget-report.json"),
    JSON.stringify({ largestNonPdf, initialTotal, budgets }, null, 2)
  );
} else {
  log("✅ Budgets within limits.");
}
