#!/usr/bin/env node
/**
 * contrast-ci-gate.mjs
 * Fails CI if any HIGH contrast issues remain in the current baseline report.
 * Optional stricter mode (set env): CONTRAST_ENFORCE_MEDIUM=1 fails also on any MEDIUM issues.
 * Source report: docs/style-inventory/contrast-baseline.json
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const REPORT_PATH = join(ROOT, "docs/style-inventory/contrast-baseline.json");

if (!existsSync(REPORT_PATH)) {
  console.log("[contrast-gate] Report missing. Generating baseline...");
  const r = spawnSync("node", ["scripts/contrast-baseline.mjs"], {
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error("[contrast-gate] Failed to generate baseline.");
    process.exit(1);
  }
}

let json;
try {
  json = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
} catch (e) {
  console.error("[contrast-gate] Could not parse report:", e.message);
  process.exit(1);
}

const high = json.totals?.HIGH || 0;
const medium = json.totals?.MEDIUM || 0;
const enforceMedium = process.env.CONTRAST_ENFORCE_MEDIUM === "1";

if (high > 0) {
  console.error(
    `\n[FAIL] Contrast gate: ${high} HIGH issue(s) present (must be 0).`
  );
  console.error(
    "Regenerate baseline only after remediation: npm run style:contrast:baseline"
  );
  process.exit(1);
}
if (enforceMedium && medium > 0) {
  console.error(
    `\n[FAIL] Contrast gate strict: ${medium} MEDIUM issue(s) present.`
  );
  process.exit(1);
}

if (medium > 0) {
  console.log(
    `[contrast-gate] PASS (High=0). Note: ${medium} MEDIUM issue(s) remain.`
  );
} else {
  console.log("[contrast-gate] PASS (High=0 Medium=0).");
}
