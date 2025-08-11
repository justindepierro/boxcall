#!/usr/bin/env node
/**
 * a11y-ci-gate.mjs
 * Runs accessibility smoke scan and fails if violations exist (after allowlist filtering).
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const REPORT_JSON = join(ROOT, "docs/style-inventory/a11y-smoke-report.json");
const allowIds = (process.env.A11Y_ALLOW || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const run = spawnSync("tsx", ["scripts/a11y_smoke_pages.ts"], {
  stdio: "inherit",
});
if (run.status !== 0) {
  console.error("[a11y-gate] Smoke script failed.");
  process.exit(1);
}
if (!existsSync(REPORT_JSON)) {
  console.error("[a11y-gate] Report missing.");
  process.exit(1);
}
let data;
try {
  data = JSON.parse(readFileSync(REPORT_JSON, "utf8"));
} catch (e) {
  console.error("[a11y-gate] Parse error:", e.message);
  process.exit(1);
}
const violations = [];
for (const page of data.results || []) {
  for (const v of page.violations || []) {
    if (allowIds.includes(v.id)) continue;
    violations.push({ page: page.path, id: v.id, impact: v.impact });
  }
}
if (violations.length) {
  console.error(`\n[FAIL] A11y gate: ${violations.length} violation(s).`);
  violations
    .slice(0, 40)
    .forEach((v) =>
      console.error(`  - ${v.page} :: ${v.id} (${v.impact || "n/a"})`)
    );
  if (violations.length > 40)
    console.error(`  ... ${violations.length - 40} more`);
  process.exit(1);
}
console.log("[a11y-gate] PASS (0 violations)");
