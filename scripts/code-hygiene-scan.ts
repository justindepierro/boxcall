#!/usr/bin/env tsx
import { globby } from "globby";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs/architecture");
mkdirSync(OUT, { recursive: true });

const PATTERNS = [
  { name: "@ts-ignore", re: /@ts-ignore/g },
  { name: "eslint-disable", re: /eslint-disable/g },
  { name: "as any", re: /\bas any\b/g },
  { name: "any type", re: /:\s*any\b/g },
  { name: "console.log", re: /console\.log\(/g },
  { name: "debugger", re: /\bdebugger\b/g },
  { name: "TODO", re: /\bTODO\b/g },
  { name: "FIXME", re: /\bFIXME\b/g },
];

(async () => {
  const files = await globby([
    "src/**/*.{ts,tsx,js,jsx}",
    "scripts/**/*.{ts,js}",
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/__tests__/**",
  ]);

  const hits: Record<string, { file: string; line: number; match: string }[]> =
    {};

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const p of PATTERNS) {
      let m: RegExpExecArray | null;
      const re = new RegExp(
        p.re,
        p.re.flags.includes("g") ? p.re.flags : p.re.flags + "g"
      );
      while ((m = re.exec(text))) {
        const line = text.slice(0, m.index).split("\n").length;
        (hits[p.name] ||= []).push({ file, line, match: m[0] });
      }
    }
  }

  const jsonPath = join(OUT, "code-smells.json");
  writeFileSync(jsonPath, JSON.stringify(hits, null, 2));
  const total = Object.values(hits).reduce((a, arr) => a + arr.length, 0);

  const md = [
    "# Code Hygiene Report",
    "",
    `Total occurrences: ${total}`,
    "",
    ...Object.entries(hits).map(
      ([k, arr]) =>
        `## ${k} (${arr.length})\n` +
        arr
          .slice(0, 500)
          .map((h) => `- ${h.file}:${h.line} — ${h.match}`)
          .join("\n")
    ),
  ].join("\n");

  writeFileSync(join(OUT, "CODE_HYGIENE_REPORT.md"), md);

  const severe =
    (hits["@ts-ignore"]?.length || 0) +
    (hits["eslint-disable"]?.length || 0) +
    (hits["debugger"]?.length || 0);
  if (severe > 0) {
    process.exitCode = 2;
  }
})();
