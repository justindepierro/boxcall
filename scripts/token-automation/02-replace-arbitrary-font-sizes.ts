#!/usr/bin/env tsx
/**
 * Script 2: Replace Arbitrary Font Size Values
 *
 * Handles font-size replacements in Tailwind arbitrary values like:
 * - text-[18px] → text-lg
 * - text-[14px] → text-sm
 * - text-[12px] → text-xs
 *
 * HIGH CONFIDENCE - Tailwind has standard size mappings
 */

import { Project } from "ts-morph";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Exact px-to-Tailwind size mappings
const FONT_SIZE_MAPPINGS: Record<string, string> = {
  "10px": "text-xs",
  "11px": "text-xs",
  "12px": "text-xs",
  "13px": "text-sm",
  "14px": "text-sm",
  "15px": "text-base",
  "16px": "text-base",
  "17px": "text-lg",
  "18px": "text-lg",
  "19px": "text-lg",
  "20px": "text-xl",
  "21px": "text-xl",
  "22px": "text-xl",
  "24px": "text-2xl",
  "26px": "text-2xl",
  "28px": "text-2xl",
  "30px": "text-3xl",
  "32px": "text-3xl",
  "36px": "text-4xl",
  "40px": "text-4xl",
  "48px": "text-5xl",
};

interface Replacement {
  file: string;
  line: number;
  original: string;
  replacement: string;
  context: string;
}

function findArbitraryFontSizes(
  filePath: string,
  project: Project
): Replacement[] {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return [];

  const replacements: Replacement[] = [];
  const fullText = sourceFile.getFullText();

  // Match text-[Npx] patterns
  const regex = /text-\[(\d+)px\]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(fullText)) !== null) {
    const pxValue = match[1] + "px";
    const tailwindSize = FONT_SIZE_MAPPINGS[pxValue];

    if (tailwindSize) {
      const pos = sourceFile.getLineAndColumnAtPos(match.index);
      const lineText = fullText.split("\n")[pos.line - 1];

      replacements.push({
        file: filePath,
        line: pos.line,
        original: match[0],
        replacement: tailwindSize,
        context: lineText.trim(),
      });
    }
  }

  return replacements;
}

async function main() {
  const projectRoot = resolve(__dirname, "../..");
  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });

  project.addSourceFilesAtPaths("src/**/*.{ts,tsx}");

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const path = sf.getFilePath();
    return (
      (path.endsWith(".tsx") || path.endsWith(".ts")) &&
      !path.includes(".test.") &&
      !path.includes("node_modules")
    );
  });

  console.log(
    `🔍 Scanning ${sourceFiles.length} files for arbitrary font sizes...\n`
  );

  const allReplacements: Replacement[] = [];
  const fileReplacements = new Map<string, Replacement[]>();

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const replacements = findArbitraryFontSizes(filePath, project);

    if (replacements.length > 0) {
      allReplacements.push(...replacements);
      fileReplacements.set(filePath, replacements);
    }
  }

  console.log(
    `📊 Found ${allReplacements.length} arbitrary font sizes across ${fileReplacements.size} files\n`
  );

  fileReplacements.forEach((replacements, filePath) => {
    const shortPath = filePath.replace(projectRoot, "");
    console.log(`\n📁 ${shortPath} (${replacements.length} matches)`);
    replacements.forEach((r) => {
      console.log(`   Line ${r.line}: ${r.original} → ${r.replacement}`);
    });
  });

  console.log(`\n\n💡 DRY RUN COMPLETE`);
  console.log(`\nTo apply these changes, run with --apply flag\n`);

  if (process.argv.includes("--apply")) {
    console.log(`\n🚀 APPLYING CHANGES...\n`);

    for (const [filePath, replacements] of fileReplacements) {
      const sourceFile = project.getSourceFile(filePath);
      if (!sourceFile) continue;

      let text = sourceFile.getFullText();

      // Replace all arbitrary font sizes
      replacements.forEach((r) => {
        text = text.replace(new RegExp(r.original, "g"), r.replacement);
      });

      sourceFile.replaceWithText(text);
      await sourceFile.save();

      console.log(`   ✅ ${filePath.replace(projectRoot, "")}`);
    }

    console.log(`\n✨ Applied ${allReplacements.length} replacements\n`);
  }
}

main().catch(console.error);
