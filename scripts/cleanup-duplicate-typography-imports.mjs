#!/usr/bin/env node
/**
 * cleanup-duplicate-typography-imports.mjs
 *
 * Scans all TS/TSX source files and removes duplicate Typography imports produced by
 * earlier naive insertion. Keeps a single canonical import per file, preferring the
 * barrel path (../design-system) over direct component path (../design-system/Typography).
 * Optionally normalizes direct paths to barrel paths for consistency.
 *
 * Usage:
 *   node scripts/cleanup-duplicate-typography-imports.mjs          (dry run)
 *   node scripts/cleanup-duplicate-typography-imports.mjs --write  (apply fixes)
 */

import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd(), "src");
const write = process.argv.includes("--write");

/** Collect all .ts/.tsx files recursively */
function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (/\.(tsx?|cts|mts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// Regex to capture import lines that include Typography from a design-system path
// Groups: 1 = full matched line, 2 = import path
const allTypographyImportsRE =
  /import\s+{[^}]*\bTypography\b[^}]*}\s+from\s+['"]([^'";]+design-system(?:\/Typography)?)['"];?/g;

function normalizePath(importPath) {
  // Strip trailing /Typography if present to get barrel
  return importPath.replace(/\/Typography$/, "");
}

function shortestPath(paths) {
  return paths.sort((a, b) => a.length - b.length)[0];
}

const changed = [];

for (const file of collectFiles(root)) {
  const code = fs.readFileSync(file, "utf8");
  let matchCount = 0;
  const imports = [];
  let m;
  while ((m = allTypographyImportsRE.exec(code)) !== null) {
    matchCount++;
    imports.push({ full: m[0], path: m[1] });
  }
  if (matchCount <= 1) {
    continue; // nothing to fix
  }

  // Determine canonical path
  const normalizedPaths = [
    ...new Set(imports.map((i) => normalizePath(i.path))),
  ];
  const canonicalBase = shortestPath(normalizedPaths);
  const canonicalImportLine = `import { Typography } from "${canonicalBase}";`;

  // Keep only one import, remove others, and ensure the kept import uses canonical line
  let firstKept = false;
  const lines = code.split(/\n/);
  const newLines = lines.filter((line) => {
    const importLineMatch = line.match(
      /import\s+{[^}]*\bTypography\b[^}]*}\s+from\s+['"][^'";]+design-system(?:\/Typography)?['"];?/
    );
    if (!importLineMatch) return true;
    if (!firstKept) {
      firstKept = true;
      return true; // We'll replace content later
    }
    return false; // drop duplicates
  });

  // Replace the (now first) import line with canonical version
  for (let i = 0; i < newLines.length; i++) {
    if (
      newLines[i].match(
        /import\s+{[^}]*\bTypography\b[^}]*}\s+from\s+['"][^'";]+design-system(?:\/Typography)?['"];?/
      )
    ) {
      if (newLines[i] !== canonicalImportLine) {
        newLines[i] = canonicalImportLine;
      }
      break;
    }
  }

  const updated = newLines.join("\n");
  if (updated !== code) {
    if (write) {
      fs.writeFileSync(file, updated, "utf8");
    }
    changed.push({
      file,
      removed: matchCount - 1,
      canonical: canonicalImportLine,
    });
  }
}

if (changed.length === 0) {
  console.log("No duplicate Typography imports found.");
} else {
  console.log(
    `${write ? "Fixed" : "Would fix"} duplicate Typography imports in ${changed.length} file(s).`
  );
  for (const c of changed) {
    console.log(`- ${c.file} (removed ${c.removed}) => ${c.canonical}`);
  }
  if (!write) {
    console.log("\nRun with --write to apply changes.");
  }
}
