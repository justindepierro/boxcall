#!/usr/bin/env node
/*
Perf budget gate (Step 19)

- Builds a dependency-closed JS set per target using Vite's manifest.
- Computes gzip size of each unique JS file in that target.
- Fails with non-zero exit code when any target exceeds its budget.

This is intentionally simple + durable:
- Uses Vite `build.manifest = true` (already enabled in vite.config.ts)
- Avoids extra deps; uses Node's zlib for gzip.
*/

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const rootDir = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function findManifestPath(distDir) {
  const candidates = [
    path.join(distDir, ".vite", "manifest.json"),
    path.join(distDir, "manifest.json"),
  ];
  for (const candidate of candidates) {
    if (fileExists(candidate)) return candidate;
  }
  return null;
}

function gzipBytes(buffer) {
  return zlib.gzipSync(buffer, { level: 9 }).length;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Resolve a Vite manifest entry by match strings.
 *
 * Strategy:
 * - exact key match
 * - else, match if key endsWith(match) or key.includes(match)
 *
 * If multiple entries match, we fail to force specificity.
 */
function resolveManifestKey(manifest, matchList) {
  const keys = Object.keys(manifest);

  for (const match of matchList) {
    if (manifest[match]) return match;
  }

  const matches = [];
  for (const key of keys) {
    for (const match of matchList) {
      if (key === match) {
        matches.push(key);
      } else if (key.endsWith(match)) {
        matches.push(key);
      } else if (key.includes(match)) {
        matches.push(key);
      }
    }
  }

  const unique = Array.from(new Set(matches));
  if (unique.length === 1) return unique[0];
  if (unique.length === 0) return null;

  return { ambiguous: unique };
}

function collectJsFilesForEntry(manifest, entryKey) {
  const visited = new Set();
  const stack = [entryKey];

  while (stack.length > 0) {
    const key = stack.pop();
    if (!key || visited.has(key)) continue;
    visited.add(key);

    const entry = manifest[key];
    if (!entry) continue;

    const imports = Array.isArray(entry.imports) ? entry.imports : [];
    for (const dep of imports) {
      if (!visited.has(dep)) stack.push(dep);
    }
  }

  // Convert manifest keys into output JS files.
  const jsFiles = new Set();
  for (const key of visited) {
    const entry = manifest[key];
    if (!entry) continue;

    if (typeof entry.file === "string" && entry.file.endsWith(".js")) {
      jsFiles.add(entry.file);
    }
  }

  return Array.from(jsFiles);
}

function sumGzipForFiles(distDir, files) {
  let total = 0;
  const missing = [];

  for (const rel of files) {
    const abs = path.join(distDir, rel);
    if (!fileExists(abs)) {
      missing.push(rel);
      continue;
    }
    const buf = fs.readFileSync(abs);
    total += gzipBytes(buf);
  }

  return { totalGzipBytes: total, missing };
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    reportOnly: args.has("--report"),
    distDir: (() => {
      const prefix = "--dist=";
      const arg = argv.find((a) => a.startsWith(prefix));
      return arg ? arg.slice(prefix.length) : "dist";
    })(),
  };
}

function main() {
  const { reportOnly, distDir: distDirArg } = parseArgs(process.argv);
  const distDir = path.isAbsolute(distDirArg)
    ? distDirArg
    : path.join(rootDir, distDirArg);

  if (!fileExists(distDir)) {
    console.error(`❌ dist not found at ${distDir}. Run \`npm run build\` first.`);
    process.exit(1);
  }

  const manifestPath = findManifestPath(distDir);
  if (!manifestPath) {
    console.error(
      "❌ Vite manifest not found. Expected dist/.vite/manifest.json (or dist/manifest.json)."
    );
    process.exit(1);
  }

  const budgetsPath = path.join(rootDir, "scripts", "perf", "budgets.json");
  if (!fileExists(budgetsPath)) {
    console.error(`❌ budgets.json not found at ${budgetsPath}`);
    process.exit(1);
  }

  const manifest = readJson(manifestPath);
  const budgets = readJson(budgetsPath);

  if (!budgets || !Array.isArray(budgets.targets)) {
    console.error("❌ Invalid budgets.json: expected { targets: [...] }");
    process.exit(1);
  }

  const results = [];
  const failures = [];

  for (const target of budgets.targets) {
    const name = String(target.name || "(unnamed)");
    const max = Number(target.maxGzipBytes);
    const match = Array.isArray(target.match) ? target.match.map(String) : [];

    if (!Number.isFinite(max) || max <= 0 || match.length === 0) {
      failures.push({
        name,
        reason: "invalid-config",
        detail: "Each target needs { name, match: string[], maxGzipBytes: number }",
      });
      continue;
    }

    const resolved = resolveManifestKey(manifest, match);
    if (!resolved) {
      failures.push({
        name,
        reason: "missing-target",
        detail: `No manifest entry matched: ${match.join(", ")}`,
      });
      continue;
    }

    if (typeof resolved === "object" && resolved.ambiguous) {
      failures.push({
        name,
        reason: "ambiguous-target",
        detail: `Multiple manifest entries matched: ${resolved.ambiguous.join(", ")}`,
      });
      continue;
    }

    const entryKey = resolved;
    const jsFiles = collectJsFilesForEntry(manifest, entryKey);
    const { totalGzipBytes, missing } = sumGzipForFiles(distDir, jsFiles);

    const ok = totalGzipBytes <= max;

    results.push({
      name,
      entryKey,
      jsFileCount: jsFiles.length,
      gzipBytes: totalGzipBytes,
      maxGzipBytes: max,
      ok,
      missing,
    });

    if (!ok) {
      failures.push({
        name,
        reason: "budget-exceeded",
        detail: `${formatBytes(totalGzipBytes)} > ${formatBytes(max)}`,
      });
    }

    if (missing.length > 0) {
      failures.push({
        name,
        reason: "missing-files",
        detail: `Missing ${missing.length} file(s) referenced by manifest (example: ${missing[0]})`,
      });
    }
  }

  // Output summary (always)
  console.log("\n📦 Perf Budgets (gzip JS, dependency-closed)");
  console.log(`Manifest: ${path.relative(rootDir, manifestPath)}`);
  console.log(`Budgets:  ${path.relative(rootDir, budgetsPath)}`);

  for (const r of results) {
    const status = r.ok ? "✅" : "❌";
    console.log(
      `${status} ${r.name}: ${formatBytes(r.gzipBytes)} / ${formatBytes(r.maxGzipBytes)} (${r.jsFileCount} js files)`
    );
  }

  // Also show unresolved targets (missing/ambiguous/config problems)
  const unresolved = failures.filter(
    (f) => f.reason !== "budget-exceeded" && f.reason !== "missing-files"
  );
  if (unresolved.length > 0) {
    console.log("\nUnresolved targets:");
    for (const f of unresolved) {
      console.log(`- ${f.name}: ${f.reason}${f.detail ? ` — ${f.detail}` : ""}`);
    }
  }

  if (reportOnly) {
    console.log("\n(report-only mode; not failing CI)\n");
    process.exit(0);
  }

  if (failures.length > 0) {
    console.error("\n❌ Perf budget check failed:");
    for (const f of failures) {
      console.error(`- ${f.name}: ${f.reason}${f.detail ? ` — ${f.detail}` : ""}`);
    }
    process.exit(1);
  }

  console.log("\n✅ Perf budget check passed\n");
}

main();
