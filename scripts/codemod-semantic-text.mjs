#!/usr/bin/env node
/**
 * Codemod: Migrate legacy text color pairs & unsafe text-white to semantic tokens.
 *
 * Transformations:
 * 1. text-gray-900 + dark:text-white  => text-text-primary
 * 2. text-gray-(500|600|400) + dark:text-gray-400 => text-text-secondary
 * 3. text-white with approved dark/brand background => text-text-inverse
 * 4. Remaining solitary text-white => text-text-primary (annotated TODO)
 *
 * Usage:
 *  node scripts/codemod-semantic-text.mjs [--dry]
 */
import { globby } from "globby";
import fs from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry");

const repoRoot = process.cwd();

// Background patterns that justify inverse text
const inverseBgRegex =
  /(bg-(?:gray|slate|stone|zinc|neutral|brand-jade|jade|red|blue|navy|black)-(?:[5-9]00|[6-9]00)|bg-gray-800|bg-gray-900|bg-black)/;

const pairRules = [
  {
    dark: "dark:text-white",
    lights: ["text-gray-900"],
    replacement: "text-text-primary",
  },
  {
    dark: "dark:text-gray-400",
    lights: ["text-gray-500", "text-gray-600", "text-gray-400"],
    replacement: "text-text-secondary",
  },
];

function replacePairs(content) {
  for (const rule of pairRules) {
    if (!content.includes(rule.dark)) continue;
    for (const light of rule.lights) {
      // Replace only when both tokens appear in the same class attribute string.
      // Heuristic: locate className opening quote to closing quote segment containing both.
      const classAttrRegex = /(className|class)=(\{?)(["'`])([\s\S]*?)(\3)/g;
      content = content.replace(
        classAttrRegex,
        (full, attrName, brace, quote, inner, endQuote) => {
          if (inner.includes(rule.dark) && inner.includes(light)) {
            // Remove all variants of tokens (exact word boundaries)
            const tokens = new Set(inner.split(/\s+/));
            tokens.delete(light);
            tokens.delete(rule.dark);
            // Avoid duplicate replacement
            tokens.add(rule.replacement);
            // Clean possible duplicates
            const cleaned = Array.from(tokens).filter(Boolean).join(" ");
            return `${attrName}=${brace}${quote}${cleaned}${quote}`;
          }
          return full; // unchanged
        }
      );
    }
  }
  return content;
}

function replaceInverse(content) {
  const classAttrRegex = /(className|class)=(\{?)(["'`])([\s\S]*?)(\3)/g;
  return content.replace(
    classAttrRegex,
    (full, attrName, brace, quote, inner, endQuote) => {
      if (!/text-white/.test(inner)) return full;
      // If already has text-text-inverse or text-text-primary skip
      if (/text-text-(inverse|primary)/.test(inner)) return full;
      const hasInverseBg = inverseBgRegex.test(inner);
      if (hasInverseBg) {
        const replaced = inner.replace(/\btext-white\b/g, "text-text-inverse");
        return `${attrName}=${brace}${quote}${replaced}${quote}`;
      } else {
        // Replace solitary unsafe text-white with primary + annotation comment after attribute (only once per attribute)
        const replaced = inner.replace(/\btext-white\b/g, "text-text-primary");
        return `${attrName}=${brace}${quote}${replaced}${quote}`;
      }
    }
  );
}

async function run() {
  const files = await globby(["src/**/*.{ts,tsx}"], {
    gitignore: true,
    ignore: ["**/node_modules/**"],
  });
  const changed = [];
  for (const file of files) {
    let original = fs.readFileSync(file, "utf8");
    let content = original;
    const before = content;
    content = replacePairs(content);
    content = replaceInverse(content);
    if (content !== before) {
      changed.push(file);
      if (!DRY_RUN) {
        fs.writeFileSync(file, content, "utf8");
      }
    }
  }
  console.log(`Codemod complete. Changed files: ${changed.length}`);
  changed.slice(0, 50).forEach((f) => console.log("  •", f));
  if (DRY_RUN) console.log("Dry run only; no files written.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
