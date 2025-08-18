#!/usr/bin/env node
/**
 * contrast-live-gate.mjs
 * Fails if the a11y smoke report contains live contrast findings below thresholds.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const REPORT_JSON = join(ROOT, "docs/style-inventory/a11y-smoke-report.json");

// Ensure dev server is running; if not, users should run it before this gate.
const run = spawnSync("tsx", ["scripts/a11y_smoke_pages.ts"], {
  stdio: "inherit",
});
if (run.status !== 0) {
  console.error("[contrast-live-gate] Smoke script failed.");
  process.exit(1);
}
if (!existsSync(REPORT_JSON)) {
  console.error("[contrast-live-gate] Report missing.");
  process.exit(1);
}
let data;
try {
  data = JSON.parse(readFileSync(REPORT_JSON, "utf8"));
} catch (e) {
  console.error("[contrast-live-gate] Parse error:", e.message);
  process.exit(1);
}
let findings = [];
for (const page of data.results || []) {
  const list = page.contrastFindings || [];
  for (const f of list) {
    findings.push({ page: page.path, ...f });
  }
}
if (findings.length) {
  console.error(`\n[FAIL] Contrast live gate: ${findings.length} finding(s).`);
  findings
    .slice(0, 40)
    .forEach((f) =>
      console.error(
        `  - ${f.page} :: ${f.role || f.selector || "el"} ${f.name || ""} ratio=${f.ratio} (< ${f.threshold}) — ${f.reason}`
      )
    );
  if (findings.length > 40) console.error(`  ... ${findings.length - 40} more`);
  process.exit(1);
}
console.log("[contrast-live-gate] PASS (0 findings)");
