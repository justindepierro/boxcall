#!/usr/bin/env tsx
/**
 * Script 4: Replace Hex Colors in Components/Pages Only
 *
 * Targets ONLY component and page files, excluding:
 * - Token definition files
 * - Theme/registry files
 * - CSS files
 * - Test files
 *
 * This is a more aggressive cleanup focusing on application code.
 */

import { Project, SourceFile } from "ts-morph";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Comprehensive hex-to-token mapping
const HEX_TO_TOKEN: Record<string, string> = {
  // Jade/Emerald/Green
  "#ecfdf5": "colorTokens.emerald[50]",
  "#d1fae5": "colorTokens.emerald[100]",
  "#a7f3d0": "colorTokens.emerald[200]",
  "#6ee7b7": "colorTokens.emerald[300]",
  "#34d399": "colorTokens.emerald[400]",
  "#10b981": "colorTokens.emerald[500]",
  "#059669": "colorTokens.emerald[600]",
  "#047857": "colorTokens.emerald[700]",
  "#065f46": "colorTokens.emerald[800]",
  "#064e3b": "colorTokens.emerald[900]",
  "#00a86b": "colorTokens.jade[500]", // Brand primary

  // Blue
  "#eff6ff": "colorTokens.blue[50]",
  "#dbeafe": "colorTokens.blue[100]",
  "#bfdbfe": "colorTokens.blue[200]",
  "#93c5fd": "colorTokens.blue[300]",
  "#60a5fa": "colorTokens.blue[400]",
  "#3b82f6": "colorTokens.blue[500]",
  "#2563eb": "colorTokens.blue[600]",
  "#1d4ed8": "colorTokens.blue[700]",
  "#1e40af": "colorTokens.blue[800]",
  "#1e3a8a": "colorTokens.blue[900]",

  // Indigo
  "#e0e7ff": "colorTokens.indigo[100]",
  "#c7d2fe": "colorTokens.indigo[200]",
  "#a5b4fc": "colorTokens.indigo[300]",
  "#818cf8": "colorTokens.indigo[400]",
  "#6366f1": "colorTokens.indigo[500]",
  "#4f46e5": "colorTokens.indigo[600]",
  "#4338ca": "colorTokens.indigo[700]",
  "#3730a3": "colorTokens.indigo[800]",
  "#312e81": "colorTokens.indigo[900]",

  // Slate/Gray
  "#f8fafc": "colorTokens.slate[50]",
  "#f1f5f9": "colorTokens.slate[100]",
  "#e2e8f0": "colorTokens.slate[200]",
  "#cbd5e1": "colorTokens.slate[300]",
  "#94a3b8": "colorTokens.slate[400]",
  "#64748b": "colorTokens.slate[500]",
  "#475569": "colorTokens.slate[600]",
  "#334155": "colorTokens.slate[700]",
  "#1e293b": "colorTokens.slate[800]",
  "#0f172a": "colorTokens.slate[900]",

  // Navy (custom)
  "#0a0f1a": "colorTokens.navy[950]",

  // Amber/Yellow
  "#fffbeb": "colorTokens.amber[50]",
  "#fef3c7": "colorTokens.amber[100]",
  "#fde68a": "colorTokens.amber[200]",
  "#fcd34d": "colorTokens.amber[300]",
  "#fbbf24": "colorTokens.amber[400]",
  "#f59e0b": "colorTokens.amber[500]",
  "#d97706": "colorTokens.amber[600]",
  "#b45309": "colorTokens.amber[700]",
  "#92400e": "colorTokens.amber[800]",

  // Red
  "#fef2f2": "colorTokens.red[50]",
  "#fee2e2": "colorTokens.red[100]",
  "#fecaca": "colorTokens.red[200]",
  "#fca5a5": "colorTokens.red[300]",
  "#f87171": "colorTokens.red[400]",
  "#ef4444": "colorTokens.red[500]",
  "#dc2626": "colorTokens.red[600]",
  "#b91c1c": "colorTokens.red[700]",
  "#991b1b": "colorTokens.red[800]",

  // Purple/Violet
  "#f5f3ff": "colorTokens.violet[50]",
  "#ede9fe": "colorTokens.violet[100]",
  "#ddd6fe": "colorTokens.violet[200]",
  "#c4b5fd": "colorTokens.violet[300]",
  "#a78bfa": "colorTokens.violet[400]",
  "#8b5cf6": "colorTokens.violet[500]",
  "#7c3aed": "colorTokens.violet[600]",
  "#6d28d9": "colorTokens.violet[700]",

  "#f3e8ff": "colorTokens.purple[100]",
  "#e9d5ff": "colorTokens.purple[200]",

  // Cyan
  "#ecfeff": "colorTokens.cyan[50]",
  "#cffafe": "colorTokens.cyan[100]",
  "#a5f3fc": "colorTokens.cyan[200]",
  "#67e8f9": "colorTokens.cyan[300]",
  "#22d3ee": "colorTokens.cyan[400]",
  "#06b6d4": "colorTokens.cyan[500]",
  "#0891b2": "colorTokens.cyan[600]",

  // Gradients in bg-[] (keep as-is, marked for review)
  "#f5f9f6": "colorTokens.jade[50]", // Light jade gradient
  "#eef3f1": "colorTokens.emerald[50]",
};

interface Replacement {
  file: string;
  line: number;
  oldValue: string;
  newValue: string;
  context: string;
}

/**
 * Find hex colors in a file
 */
function findHexColorsInFile(
  filePath: string,
  project: Project
): Replacement[] {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return [];

  const replacements: Replacement[] = [];
  const text = sourceFile.getFullText();
  const lines = text.split("\n");

  // Match hex colors (case insensitive)
  const regex = /#[0-9a-fA-F]{6}/gi;

  lines.forEach((line, index) => {
    const matches = line.matchAll(regex);
    for (const match of matches) {
      const hex = match[0].toLowerCase();
      const token = HEX_TO_TOKEN[hex];

      if (token) {
        replacements.push({
          file: filePath,
          line: index + 1,
          oldValue: match[0],
          newValue: token,
          context: line.trim().substring(0, 80),
        });
      }
    }
  });

  return replacements;
}

/**
 * Calculate relative import path
 */
function calculateImportPath(filePath: string): string {
  const parts = filePath.split("/");
  const srcIndex = parts.indexOf("src");
  if (srcIndex === -1) return "../design-system/tokens";

  const depth = parts.length - srcIndex - 2;
  return "../".repeat(depth) + "design-system/tokens";
}

/**
 * Add colorTokens import if not present
 */
function addColorTokensImport(sourceFile: SourceFile, importPath: string) {
  const existingImport = sourceFile.getImportDeclaration(
    (imp) => imp.getModuleSpecifierValue() === importPath
  );

  if (existingImport) {
    const namedImports = existingImport.getNamedImports();
    const hasColorTokens = namedImports.some(
      (imp) => imp.getName() === "colorTokens"
    );

    if (!hasColorTokens) {
      existingImport.addNamedImport("colorTokens");
    }
  } else {
    const imports = sourceFile.getImportDeclarations();
    if (imports.length > 0) {
      sourceFile.insertImportDeclaration(imports.length, {
        moduleSpecifier: importPath,
        namedImports: ["colorTokens"],
      });
    } else {
      sourceFile.insertImportDeclaration(0, {
        moduleSpecifier: importPath,
        namedImports: ["colorTokens"],
      });
    }
  }
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

  // Sort replacements by line (descending) to avoid offset issues
  const sorted = [...replacements].sort((a, b) => b.line - a.line);

  // Replace all occurrences (case insensitive)
  sorted.forEach((r) => {
    const regex = new RegExp(
      r.oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    text = text.replace(regex, r.newValue);
  });

  sourceFile.replaceWithText(text);

  // Add import
  const importPath = calculateImportPath(filePath);
  addColorTokensImport(sourceFile, importPath);

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

  // Filter to ONLY components and pages, exclude infrastructure
  const targetFiles = project.getSourceFiles().filter((sf) => {
    const path = sf.getFilePath();
    return (
      (path.includes("/components/") || path.includes("/pages/")) &&
      !path.includes("/design-system/tokens") &&
      !path.includes("/themes/") &&
      !path.includes("token-automation") &&
      !path.includes(".test.") &&
      !path.includes(".spec.") &&
      !path.includes("__tests__") &&
      !path.includes(".css.ts") &&
      !path.endsWith(".css")
    );
  });

  console.log(
    `🔍 Scanning ${targetFiles.length} component/page files for hex colors...\n`
  );

  const allReplacements: Replacement[] = [];
  const fileMap = new Map<string, Replacement[]>();

  for (const sourceFile of targetFiles) {
    const filePath = sourceFile.getFilePath();
    const replacements = findHexColorsInFile(filePath, project);

    if (replacements.length > 0) {
      allReplacements.push(...replacements);
      fileMap.set(filePath, replacements);
    }
  }

  console.log(
    `📊 Found ${allReplacements.length} hex colors across ${fileMap.size} files\n\n`
  );

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
      "   tsx scripts/token-automation/04-replace-component-hex-colors.ts --apply\n"
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
