#!/usr/bin/env node
// Bundle analyzer using Vite manifest + dist/assets sizes (with gzip)
// Outputs JSON and a simple HTML report for CI/regressions.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createGzip } from "node:zlib";

const ROOT = path.resolve(process.cwd());
const DIST = path.join(ROOT, "dist");
const MANIFEST = path.join(DIST, ".vite", "manifest.json");
const ASSETS_DIR = path.join(DIST, "assets");

async function gzipSize(filePath) {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(filePath);
    const gzip = createGzip();
    let size = 0;
    gzip.on("data", (chunk) => (size += chunk.length));
    gzip.on("end", () => resolve(size));
    gzip.on("error", reject);
    input.on("error", reject);
    input.pipe(gzip);
  });
}

async function fileByteSize(fp) {
  const stat = await fsp.stat(fp);
  return stat.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = bytes / Math.pow(k, i);
  return `${v.toFixed(v > 100 ? 0 : v > 10 ? 1 : 2)} ${sizes[i]}`;
}

async function main() {
  try {
    await fsp.access(ASSETS_DIR);
  } catch (e) {
    console.error("dist/assets not found. Build first: npm run build");
    process.exit(1);
  }

  let manifest = {};
  try {
    const raw = await fsp.readFile(MANIFEST, "utf8");
    manifest = JSON.parse(raw);
  } catch (e) {
    // Manifest may be at dist/manifest.json depending on vite version/config
    const altManifest = path.join(DIST, "manifest.json");
    try {
      const raw = await fsp.readFile(altManifest, "utf8");
      manifest = JSON.parse(raw);
    } catch (err) {
      console.warn("Manifest not found; continuing with file sizes only.");
    }
  }

  const files = (await fsp.readdir(ASSETS_DIR)).filter((f) =>
    /\.(js|css)$/.test(f)
  );

  const rows = [];
  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    const [raw, gz] = await Promise.all([
      fileByteSize(filePath),
      gzipSize(filePath),
    ]);
    const base = path.basename(file);
    const chunk = base.split("-")[0];
    const ext = path.extname(file).slice(1);
    // Try to find manifest entry
    const mfEntry = Object.values(manifest).find(
      (m) => m?.file === `assets/${base}`
    );
    rows.push({
      file: base,
      ext,
      chunk,
      rawBytes: raw,
      gzipBytes: gz,
      isEntry: Boolean(mfEntry?.isEntry),
      isDynamicEntry: Boolean(mfEntry?.isDynamicEntry),
      imports: mfEntry?.imports || [],
    });
  }

  rows.sort((a, b) => b.gzipBytes - a.gzipBytes);

  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      files: rows.length,
      rawBytes: rows.reduce((s, r) => s + r.rawBytes, 0),
      gzipBytes: rows.reduce((s, r) => s + r.gzipBytes, 0),
    },
    topByGzip: rows.slice(0, 20),
    byChunk: Object.values(
      rows.reduce((acc, r) => {
        acc[r.chunk] ||= {
          chunk: r.chunk,
          files: [],
          rawBytes: 0,
          gzipBytes: 0,
        };
        acc[r.chunk].files.push(r);
        acc[r.chunk].rawBytes += r.rawBytes;
        acc[r.chunk].gzipBytes += r.gzipBytes;
        return acc;
      }, {})
    ).sort((a, b) => b.gzipBytes - a.gzipBytes),
  };

  const outJson = path.join(ROOT, "bundle-analysis.json");
  await fsp.writeFile(outJson, JSON.stringify(summary, null, 2));

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Bundle Analysis</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #e5e7eb; text-align: left; padding: 8px 12px; font-size: 14px; }
    th { position: sticky; top: 0; background: #fff; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
  </style>
  <script>window.__DATA__ = ${JSON.stringify(summary)};</script>
  </head>
<body>
  <h1>Bundle Analysis</h1>
  <p>Generated at ${summary.generatedAt}</p>
  <h2>Top 20 assets by gzip size</h2>
  <table>
    <thead><tr><th>File</th><th>Chunk</th><th>Ext</th><th>Entry?</th><th>Raw</th><th>Gzip</th></tr></thead>
    <tbody>
      ${summary.topByGzip
        .map(
          (r) => `<tr>
          <td><code>${r.file}</code></td>
          <td>${r.chunk}</td>
          <td>${r.ext}</td>
          <td>${r.isEntry ? "yes" : r.isDynamicEntry ? "dynamic" : "no"}</td>
          <td>${formatBytes(r.rawBytes)}</td>
          <td><strong>${formatBytes(r.gzipBytes)}</strong></td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>
  <h2>By chunk group</h2>
  <table>
    <thead><tr><th>Chunk</th><th>Files</th><th>Raw</th><th>Gzip</th></tr></thead>
    <tbody>
      ${summary.byChunk
        .map(
          (c) => `<tr>
          <td>${c.chunk}</td>
          <td>${c.files.length}</td>
          <td>${formatBytes(c.rawBytes)}</td>
          <td><strong>${formatBytes(c.gzipBytes)}</strong></td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>
  <p>JSON output: <code>bundle-analysis.json</code></p>
  </body></html>`;

  const outHtml = path.join(ROOT, "bundle-analysis.html");
  await fsp.writeFile(outHtml, html, "utf8");

  console.log("Bundle analysis written:");
  console.log(" -", outJson);
  console.log(" -", outHtml);
}

main().catch((err) => {
  console.error("bundle-visualize failed:", err);
  process.exit(1);
});
