#!/usr/bin/env tsx
/**
 * verify_canonical_play_writes.ts
 * Scans source tree for direct write operations to the `plays` table
 * (insert|update|delete) outside the approved allowlist.
 * Exits with code 1 if violations are found.
 */
import fs from "fs";
import path from "path";

import { globby } from "globby";

interface Violation {
  file: string;
  line: number;
  snippet: string;
  op: string;
}

// Allowlisted files (relative to repo root) that may perform writes
const WRITE_ALLOWLIST = new Set([
  "src/services/playsService.ts",
  // Dev / scripts (explicitly ignored)
  "src/components/dev/dev-actions.ts",
  "src/utils/create-sample-data.ts",
]);

// Regex to detect write operations (basic heuristic)
const WRITE_REGEX =
  /supabase(?:\.\w+)?\.from\(["']plays["']\)\s*\.(insert|update|delete)\b/;

async function main() {
  const root = process.cwd();
  const patterns = ["src/**/*.{ts,tsx}"];
  const files = await globby(patterns, { gitignore: true, absolute: true });
  const violations: Violation[] = [];

  for (const absPath of files) {
    const relPath = path.relative(root, absPath);
    // Skip allowlist
    if (WRITE_ALLOWLIST.has(relPath)) continue;

    const content = fs.readFileSync(absPath, "utf8");
    if (
      !content.includes('from("plays")') &&
      !content.includes("from('plays')")
    )
      continue;

    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const m = line.match(WRITE_REGEX);
      if (m) {
        violations.push({
          file: relPath,
          line: idx + 1,
          snippet: line.trim().slice(0, 160),
          op: m[1],
        });
      }
    });
  }

  if (violations.length === 0) {
    console.log("\u2705 No unauthorized play write operations detected.");
    console.log(`Allowlist (${WRITE_ALLOWLIST.size}):`);
    for (const f of WRITE_ALLOWLIST) console.log("  -", f);
    process.exit(0);
  }

  console.error(
    "\n\u274C Unauthorized direct writes to plays table detected:\n"
  );
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} [${v.op}] ${v.snippet}`);
  }
  console.error(`\nTotal violations: ${violations.length}`);
  console.error(
    "\nUpdate playsService or extend allowlist only with strong justification."
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
