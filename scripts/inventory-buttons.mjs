#!/usr/bin/env node
/**
 * inventory-buttons.mjs
 * Scans the src/ tree for raw <button> usages not using the shared Button component.
 * Outputs JSON + Markdown summary in docs/style-inventory.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { relative, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = join(root, "src");
const OUT_DIR = join(root, "docs/style-inventory");

/** simple recursive gather */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(full)));
    } else if ([".tsx", ".jsx"].includes(extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

/** crude heuristic: component file that defines exported Button already covered */
function isButtonComponentFile(path) {
  return /Button\.(tsx|jsx)$/.test(path);
}

/** detect if file imports shared Button */
function usesSharedButton(src) {
  // common import patterns
  return /(import\s+\{?\s*Button\s*}?\s+from\s+['"].+Button(\.tsx)?['"])|(from\s+['"].+\/Button['"])|(import\s+Button\s+from)/.test(
    src
  );
}

function findRawButtons(src) {
  // naive HTML/JSX tag search ignoring <Button ...>
  // Capture opening tag names; exclude those preceded by letter (to avoid <Button>)
  const results = [];
  const regex = /<button(\s|>)/g;
  let m;
  while ((m = regex.exec(src))) {
    // Rough line/col
    const upto = src.slice(0, m.index);
    const line = upto.split(/\n/).length;
    results.push({ line });
  }
  return results;
}

async function run() {
  const files = await walk(SRC_DIR);
  const inventory = [];
  for (const file of files) {
    if (isButtonComponentFile(file)) continue; // skip canonical Button
    const rel = relative(root, file);
    const code = await readFile(file, "utf8");
    const rawMatches = findRawButtons(code);
    if (!rawMatches.length) continue;
    const hasSharedImport = usesSharedButton(code);
    // Filter: if file imports Button AND raw <button> occurs, we still include (mixed usage)
    if (rawMatches.length) {
      inventory.push({
        file: rel,
        count: rawMatches.length,
        lines: rawMatches.map((r) => r.line),
        hasSharedImport,
      });
    }
  }
  inventory.sort((a, b) => b.count - a.count);
  await mkdir(OUT_DIR, { recursive: true });
  const jsonPath = join(OUT_DIR, "buttons.json");
  const mdPath = join(OUT_DIR, "buttons.md");
  await writeFile(
    jsonPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        totalFiles: inventory.length,
        items: inventory,
      },
      null,
      2
    )
  );
  const md = [
    "# Raw Button Inventory",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total files with raw <button>: **${inventory.length}**`,
    "",
    "| File | Raw Buttons | Lines | Imports Shared Button? |",
    "| ---- | ----------- | ----- | ---------------------- |",
    ...inventory.map(
      (i) =>
        `| ${i.file} | ${i.count} | ${i.lines.join(", ")} | ${i.hasSharedImport ? "Yes" : "No"} |`
    ),
    "",
    "Migration Priority Heuristic:",
    "1. Files mixing raw + shared Button (Yes) -> unify first.",
    "2. Highest raw count.",
    "3. High-traffic routes (dashboard, onboarding).",
    "",
    "Next Steps:",
    '- Replace clusters with <Button variant="primary|secondary|..." size="md" />.',
    "- Remove obsolete utility classes after migration.",
  ].join("\n");
  await writeFile(mdPath, md);
  console.log(`[inventory-buttons] Wrote ${jsonPath} & ${mdPath}`);
  console.log(
    `[inventory-buttons] Total raw button files: ${inventory.length}`
  );
}

run().catch((err) => {
  console.error("[inventory-buttons] Failed:", err);
  process.exit(1);
});
