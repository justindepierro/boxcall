#!/usr/bin/env node
import fs from "node:fs";

const reportPath = "contrast-report.json";
if (!fs.existsSync(reportPath)) {
  console.error(
    "contrast-report.json not found. Run: node scripts/contrast-inventory.mjs --json > contrast-report.json"
  );
  process.exit(1);
}
const r = JSON.parse(fs.readFileSync(reportPath, "utf8"));
let md = "# Contrast Remediation Checklist\n\n";
md += `Generated: ${new Date().toISOString()}\n\n`;
md += "## Summary\n";
md += `- Light backgrounds: ${r.summary.lightBgCount}\n`;
md += `- White text near light (heuristic): ${r.summary.whiteTextOnLight}\n`;
md += `- Mid-tone 500 + white: ${r.summary.midToneWhite}\n`;
md += `- Light background button patterns: ${r.summary.lightBgButtons}\n\n`;
md += "## Prioritized Buckets\n";
const high = [];
const medium = [];
const low = [];
for (const f of r.results) {
  const score =
    (f.whiteOnLightPairs ? 3 : 0) +
    (f.midToneWhite.length ? 2 : 0) +
    (f.lightBgButtons.length ? 1 : 0);
  const line = `[ ] ${f.file}  (white-on-light:${f.whiteOnLightPairs}|mid-tone+white:${f.midToneWhite.length}|lightBgBtns:${f.lightBgButtons.length})`;
  if (score >= 4) high.push(line);
  else if (score >= 2) medium.push(line);
  else low.push(line);
}
md += "### High\n" + (high.join("\n") || "None") + "\n\n";
md += "### Medium\n" + (medium.join("\n") || "None") + "\n\n";
md += "### Low\n" + (low.join("\n") || "None") + "\n\n";
fs.writeFileSync("docs/CONTRAST_REMEDIATION.md", md);
console.log("Wrote docs/CONTRAST_REMEDIATION.md");
