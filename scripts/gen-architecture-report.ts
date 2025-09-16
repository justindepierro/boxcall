import { mkdirSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../");
const OUT_DIR = join(ROOT, "docs/architecture");
mkdirSync(OUT_DIR, { recursive: true });

const SRC = join(ROOT, "src");
// Using Madge CLI for portability (avoids ESM/CJS/Graphviz issues)
const MADGE = join(ROOT, "node_modules/.bin/madge");

function runMadge(args: string[]) {
  const res = spawnSync(MADGE, args, { encoding: "utf8" });
  const out = (res.stdout || "") + (res.stderr || "");
  return out;
}

function parseJsonLoose<T = unknown>(text: string): T {
  // Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through to relaxed parsing
  }
  // Attempt to slice to the largest balanced JSON object
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const slice = text.slice(first, last + 1);
    try {
      return JSON.parse(slice) as T;
    } catch {
      // ignore and continue
    }
  }
  // As a last resort, try to build an object from lines like "\"a\":[...]"
  const lines = text.split(/\r?\n/).filter((l) => /".*":\s*\[/.test(l));
  if (lines.length) {
    const body = lines.join("\n");
    try {
      return JSON.parse("{" + body + "}") as T;
    } catch {
      // ignore and throw below
    }
  }
  throw new Error("Failed to parse madge JSON output");
}

async function writeDotAndSvg() {
  const jsonText = runMadge([
    "--extensions",
    "ts,tsx,js,jsx",
    "--exclude",
    "(\\.test\\.(t|j)sx?$|\\.spec\\.(t|j)sx?$|__tests__/|^scripts/|^docs/)",
    "--json",
    SRC,
  ]);
  const obj = parseJsonLoose(jsonText) as Record<string, string[]>;
  const nodes = new Set<string>();
  const edges: Array<[string, string]> = [];
  for (const [from, tos] of Object.entries(obj)) {
    nodes.add(from);
    for (const to of tos) {
      nodes.add(to);
      edges.push([from, to]);
    }
  }
  const dot = [
    "digraph Dependencies {",
    "  rankdir=LR;",
    ...[...nodes].map((n) => `  "${n}";`),
    ...edges.map(([a, b]) => `  "${a}" -> "${b}";`),
    "}",
  ].join("\n");
  const dotPath = join(OUT_DIR, "dependency-graph.dot");
  writeFileSync(dotPath, dot, "utf8");
  // SVG generation optional; skip to avoid Graphviz dependency
}

async function writeJsonReport() {
  const circularText = runMadge([
    "--extensions",
    "ts,tsx,js,jsx",
    "--exclude",
    "(\\.test\\.(t|j)sx?$|\\.spec\\.(t|j)sx?$|__tests__/|^scripts/|^docs/)",
    "--circular",
    "--json",
    SRC,
  ]);
  const graphText = runMadge([
    "--extensions",
    "ts,tsx,js,jsx",
    "--exclude",
    "(\\.test\\.(t|j)sx?$|\\.spec\\.(t|j)sx?$|__tests__/|^scripts/|^docs/)",
    "--json",
    SRC,
  ]);
  const circular = parseJsonLoose(circularText) as string[][];
  const obj = parseJsonLoose(graphText) as Record<string, string[]>;
  const dependsOn: Record<string, number> = {};
  for (const [from, tos] of Object.entries(obj)) {
    for (const to of tos as string[]) dependsOn[to] = (dependsOn[to] || 0) + 1;
    if (!(from in dependsOn)) dependsOn[from] = dependsOn[from] || 0;
  }
  const orphans = Object.entries(dependsOn)
    .filter(([_, count]) => count === 0)
    .map(([m]) => m);
  const summary = {
    circular,
    orphans,
    counts: { modules: Object.keys(obj).length },
  };
  writeFileSync(
    join(OUT_DIR, "architecture-report.json"),
    JSON.stringify(summary, null, 2)
  );
}

function writeIndex() {
  const md = `# Architecture Report\n\n- Dependency Graph: dependency-graph.svg (or .dot)\n- Raw Report: architecture-report.json\n\nGenerated: ${new Date().toISOString()}\n`;
  writeFileSync(join(OUT_DIR, "ARCHITECTURE_REPORT.md"), md, "utf8");
}

await writeDotAndSvg();
await writeJsonReport();
writeIndex();
