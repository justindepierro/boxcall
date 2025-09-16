import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "docs/architecture");

function safeReadJSON(p: string) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function safeRead(p: string) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

const hygiene = safeReadJSON(join(OUT_DIR, "code-smells.json")) || {};
const arch = safeReadJSON(join(OUT_DIR, "architecture-report.json")) || {};
const routesDot = safeRead(join(OUT_DIR, "route-map.dot"));

type Hit = { file: string; line: number; match: string };
const totalSmells = Object.values(hygiene as Record<string, Hit[]>).reduce(
  (a: number, arr: Hit[]) => a + arr.length,
  0
);
const topSmellEntries = Object.entries(hygiene as Record<string, Hit[]>)
  .map(([k, v]) => [k, v.length] as const)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

const md = [
  "# Codebase Architecture Summary",
  "",
  "## Hygiene Overview",
  `- Total findings: ${totalSmells}`,
  ...topSmellEntries.map(([k, n]) => `- ${k}: ${n}`),
  "",
  "## Architecture",
  `- Circular groups: ${arch.circular?.length ?? 0}`,
  `- Orphan modules: ${arch.orphans?.length ?? 0}`,
  `- Module count: ${arch.counts?.modules ?? "?"}`,
  "",
  "## Route Map (DOT)",
  "```dot",
  routesDot.trim(),
  "```",
  "",
  "## Next Actions",
  "- Replace console.log with telemetry/logger abstractions",
  "- Remove eslint-disable and @ts-ignore; address root types",
  "- Break circular deps (if any) by moving shared code to utils/hooks",
  "- Ensure services are consumed via a barrel (`src/services/index.ts`)",
].join("\n");

writeFileSync(join(OUT_DIR, "SUMMARY.md"), md);
