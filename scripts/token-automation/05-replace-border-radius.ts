#!/usr/bin/env tsx
/**
 * Script 5: Replace Arbitrary Border Radius Values
 *
 * Targets rounded-[Npx] patterns in component/page files.
 *
 * Replacements:
 * - rounded-[28px] → rounded-[1.75rem] (consistent with design system)
 * - rounded-[36px] → rounded-[2.25rem] (consistent with design system)
 *
 * Note: We're keeping rem units for consistency with Tailwind's design system.
 * Tailwind uses: rounded-3xl = 1.5rem (24px), rounded-full = 9999px
 */

import { Project } from "ts-morph";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Border radius replacements (keeping in rem for consistency)
const BORDER_RADIUS_MAP: Record<string, string> = {
  "rounded-[28px]": "rounded-[1.75rem]", // 28px in rem
  "rounded-[36px]": "rounded-[2.25rem]", // 36px in rem
};

interface Replacement {
  file: string;
  line: number;
  oldValue: string;
  newValue: string;
  context: string;
}

/**
 * Find border radius patterns in a file
 */
function findBorderRadiusInFile(
  filePath: string,
  project: Project
): Replacement[] {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return [];

  const replacements: Replacement[] = [];
  const text = sourceFile.getFullText();
  const lines = text.split("\n");

  lines.forEach((line, index) => {
    Object.entries(BORDER_RADIUS_MAP).forEach(([oldValue, newValue]) => {
      if (line.includes(oldValue)) {
        replacements.push({
          file: filePath,
          line: index + 1,
          oldValue,
          newValue,
          context: line.trim().substring(0, 100),
        });
      }
    });
  });

  return replacements;
}

/**
 * Apply replacements to a file
 */
function applyReplacements(
  filePath: string,
  replacements: Replacement[],
  project: Project
): void {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return;

  let text = sourceFile.getFullText();

  // Replace all occurrences
  replacements.forEach((r) => {
    const regex = new RegExp(
      r.oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    text = text.replace(regex, r.newValue);
  });

  sourceFile.replaceWithText(text);
  sourceFile.saveSync();
}

async function main() {
  const applyChanges = process.argv.includes("--apply");
  const projectRoot = resolve(__dirname, "../../");

  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, "tsconfig.json"),
  });

  // Add source files
  project.addSourceFilesAtPaths("src/**/*.{ts,tsx}");

  // Filter to components and pages only
  const targetFiles = project.getSourceFiles().filter((sf) => {
    const path = sf.getFilePath();
    return (
      (path.includes("/components/") || path.includes("/pages/")) &&
      !path.includes("/design-system/tokens") &&
      !path.includes("/themes/") &&
      !path.includes("token-automation") &&
      !path.includes(".test.") &&
      !path.includes(".spec.") &&
      !path.includes("__tests__")
    );
  });

  console.log(
    `🔍 Scanning ${targetFiles.length} component/page files for border radius patterns...\n`
  );

  const allReplacements: Replacement[] = [];
  const fileMap = new Map<string, Replacement[]>();

  for (const sourceFile of targetFiles) {
    const filePath = sourceFile.getFilePath();
    const replacements = findBorderRadiusInFile(filePath, project);

    if (replacements.length > 0) {
      allReplacements.push(...replacements);
      fileMap.set(filePath, replacements);
    }
  }

  console.log(
    `📊 Found ${allReplacements.length} border radius patterns across ${fileMap.size} files\n\n`
  );

  // Display by pattern
  const byPattern = allReplacements.reduce(
    (acc, r) => {
      if (!acc[r.oldValue]) acc[r.oldValue] = [];
      acc[r.oldValue].push(r);
      return acc;
    },
    {} as Record<string, Replacement[]>
  );

  Object.entries(byPattern).forEach(([pattern, replacements]) => {
    console.log(
      `${pattern} → ${replacements[0].newValue} (${replacements.length} occurrences)`
    );
  });
  console.log("");

  // Group by file and display
  for (const [filePath, replacements] of fileMap) {
    const relativePath = filePath.replace(projectRoot, "");
    console.log(`📁 ${relativePath} (${replacements.length} matches)`);

    replacements.forEach((r) => {
      console.log(`   Line ${r.line}: ${r.oldValue} → ${r.newValue}`);
      console.log(`   Context: ${r.context}`);
    });
    console.log("");
  }

  if (!applyChanges) {
    console.log("\n💡 DRY RUN COMPLETE\n");
    console.log("To apply these changes, run with --apply flag");
    console.log(
      "   tsx scripts/token-automation/05-replace-border-radius.ts --apply\n"
    );
    return;
  }

  console.log("\n🚀 APPLYING CHANGES...\n");

  for (const [filePath, replacements] of fileMap) {
    applyReplacements(filePath, replacements, project);
    const relativePath = filePath.replace(projectRoot, "");
    console.log(`   ✅ ${relativePath}`);
  }

  console.log(
    `\n✨ Applied ${allReplacements.length} replacements to ${fileMap.size} files\n`
  );
  console.log("⚠️  Run 'npm run type-check' to verify changes\n");
}

main().catch(console.error);
