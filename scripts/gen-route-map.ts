import { globby } from "globby";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs/architecture");
mkdirSync(OUT, { recursive: true });

type RouteEdge = { from: string; to: string; file: string };

function extractPaths(code: string): string[] {
  const paths = new Set<string>();
  const jsxPathRe = /path\s*=\s*{?\s*['"]([^'"}]+)['"]/g; // <Route path="/x" ...>
  let m: RegExpExecArray | null;
  while ((m = jsxPathRe.exec(code))) {
    paths.add(m[1]);
  }
  const objectPathRe = /path\s*:\s*['"]([^'"}]+)['"]/g; // { path: '/x', element: ... }
  while ((m = objectPathRe.exec(code))) {
    paths.add(m[1]);
  }
  return [...paths];
}

(async () => {
  const files = await globby([
    "src/{navigation,routes,pages}/**/*.{ts,tsx}",
    "!**/*.test.*",
    "!**/*.spec.*",
  ]);

  const edges: RouteEdge[] = [];
  const nodes = new Set<string>();

  for (const file of files) {
    const code = readFileSync(file, "utf8");
    const paths = extractPaths(code);
    for (const p of paths) {
      nodes.add(p);
    }
    // naïve parent-child: '/a' -> '/a/b' based on prefix
    const sorted = [...paths].sort((a, b) => a.length - b.length);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[j].startsWith(sorted[i]) && sorted[i] !== sorted[j]) {
          edges.push({ from: sorted[i], to: sorted[j], file });
        }
      }
    }
  }

  const dot = [
    "digraph Routes {",
    "  rankdir=LR;",
    ...[...nodes].map((n) => `  "${n}";`),
    ...edges.map((e) => `  "${e.from}" -> "${e.to}";`),
    "}",
  ].join("\n");

  writeFileSync(join(OUT, "route-map.dot"), dot);
})();
