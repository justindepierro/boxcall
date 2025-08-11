#!/usr/bin/env ts-node
/**
 * Codemod: Convert <label|p|span|div className="... text-sm font-medium ..."> to <Typography variant="body-sm" ...>
 * Strategy: naive string-based transformation for simple static className attributes.
 * - Removes the redundant text-sm token (handled by variant)
 * - Preserves other utility classes (spacing, color, layout, font-medium retained if present)
 * - Skips any className containing 'uppercase' (likely should become label-* variant later)
 * - Adds import { Typography } from "@/components/design-system/Typography" if not present
 * Usage:
 *   ts-node scripts/codemod-label-text-sm-font-medium-to-typography.ts --dry-run
 *   ts-node scripts/codemod-label-text-sm-font-medium-to-typography.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";

interface Options {
  dryRun: boolean;
  root: string;
}

const args = process.argv.slice(2);
const opts: Options = {
  dryRun: args.includes("--dry-run"),
  root: process.cwd(),
};

const exts = new Set([".tsx"]);
const targetTags = ["label", "p", "span", "div"];

let fileCount = 0;
let occurrenceCount = 0;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (
      d.name.startsWith(".") ||
      d.name === "node_modules" ||
      d.name === "dist" ||
      d.name === "coverage"
    )
      return [];
    const full = join(dir, d.name);
    if (d.isDirectory()) return walk(full);
    if (exts.has(extname(d.name))) return [full];
    return [];
  });
}

function ensureImport(src: string): string {
  if (/Typography\s*from/.test(src) || /{\s*Typography\s*}/.test(src))
    return src; // already imported
  const lines = src.split(/\n/);
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++)
    if (/^import\s+/.test(lines[i])) lastImportIdx = i;
  const importStmt =
    'import { Typography } from "@/components/design-system/Typography";';
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, importStmt);
    return lines.join("\n");
  }
  return importStmt + "\n" + src;
}

function transformFile(path: string) {
  let src = readFileSync(path, "utf8");
  let localOccurrences = 0;

  if (!/text-sm\s+font-medium/.test(src) && !/font-medium\s+text-sm/.test(src))
    return;

  for (const tag of targetTags) {
    const blockRegex = new RegExp(
      `<${tag}([^>]*?)className=\\"([^\\"]*?(?:text-sm[^\\"]*font-medium|font-medium[^\\"]*text-sm)[^\\"]*)\\"([^>]*)>([\\s\\S]*?)</${tag}>`,
      "g"
    );
    src = src.replace(
      blockRegex,
      (match, beforeAttrs, classValue, afterAttrs, inner) => {
        if (/uppercase/.test(classValue)) return match; // skip uppercase patterns
        const cleanedClasses = classValue
          .replace(/(^|\s)text-sm(?![\w-])/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        localOccurrences++;
        const clsAttr = cleanedClasses.length
          ? ` className=\\"${cleanedClasses}\\"`
          : "";
        return `<Typography variant=\\"body-sm\\" as=\\"${tag}\\"${clsAttr}${afterAttrs}>${inner}</Typography>`;
      }
    );
  }

  if (localOccurrences) {
    src = ensureImport(src);
    fileCount++;
    occurrenceCount += localOccurrences;
    if (!opts.dryRun) writeFileSync(path, src, "utf8");
    console.log(
      `${opts.dryRun ? "Would transform" : "Transformed"} ${path} (${localOccurrences} occurrences)`
    );
  }
}

const files = walk(join(opts.root, "src"));
files.forEach((f) => transformFile(f));

console.log(
  `\nCodemod ${opts.dryRun ? "DRY RUN" : "APPLIED"}: ${fileCount} files; ${occurrenceCount} occurrences.`
);
if (opts.dryRun) console.log("Re-run without --dry-run to apply changes.");
