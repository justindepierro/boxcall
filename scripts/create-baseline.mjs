#!/usr/bin/env node
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "baseline");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// 1. Bundle stats placeholder (will rely on existing build output)
distSnapshot();
// 2. Style offenders snapshot
styleSnapshot();
// 3. Performance budget config
perfSnapshot();

function distSnapshot() {
  const dist = path.join(process.cwd(), "dist", "assets");
  let bundleReport = [];
  if (fs.existsSync(dist)) {
    const files = fs.readdirSync(dist).filter((f) => /\.(js|css)$/.test(f));
    bundleReport = files.map((f) => {
      const full = path.join(dist, f);
      const size = fs.statSync(full).size;
      return { file: f, size };
    });
  }
  fs.writeFileSync(
    path.join(outDir, "bundle-stats.json"),
    JSON.stringify(bundleReport, null, 2)
  );
}

function styleSnapshot() {
  const RAW_BG = /bg-gray-(50|100|200)\b/;
  const RAW_BORDER = /border-gray-(100|200)\b/;
  const offenders = [];
  scan(path.join(process.cwd(), "src"), (file, lines) => {
    const hits = [];
    lines.forEach((l, i) => {
      if (RAW_BG.test(l) || RAW_BORDER.test(l)) hits.push(i + 1);
    });
    if (hits.length)
      offenders.push({ file: path.relative(process.cwd(), file), lines: hits });
  });
  fs.writeFileSync(
    path.join(outDir, "raw-gray-offenders.json"),
    JSON.stringify(offenders, null, 2)
  );
}

function perfSnapshot() {
  const perf = {
    createdAt: new Date().toISOString(),
    budgets: {
      largestNonPdfChunkGzipTarget: 180 * 1024,
      initialJsGzipTarget: 250 * 1024,
    },
  };
  fs.writeFileSync(
    path.join(outDir, "performance-budgets.json"),
    JSON.stringify(perf, null, 2)
  );
}

function scan(dir, onFile) {
  for (const e of fs.readdirSync(dir)) {
    if (e.startsWith(".")) continue;
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) scan(full, onFile);
    else if (/\.(tsx?|css|md)$/.test(e)) {
      const content = fs.readFileSync(full, "utf8");
      onFile(full, content.split(/\n/));
    }
  }
}

console.log("Baseline snapshot created in ./baseline");
