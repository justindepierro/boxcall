#!/usr/bin/env tsx
/**
 * Script 1: Replace Exact Hex Color Matches
 *
 * Handles straightforward hex → token replacements where the hex value
 * has a direct, unambiguous token equivalent.
 *
 * SAFE REPLACEMENTS (high confidence):
 * - Exact Tailwind color matches (e.g., #3b82f6 = blue-500)
 * - Common semantic colors we've established patterns for
 * - No context needed - direct substitution
 */

import { Project, SourceFile } from "ts-morph";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Exact hex-to-token mappings (high confidence only)
const EXACT_HEX_TO_TOKEN: Record<string, string> = {
  // Blue scale
  "#dbeafe": "colorTokens.blue[50]",
  "#bfdbfe": "colorTokens.blue[100]",
  "#93c5fd": "colorTokens.blue[300]",
  "#60a5fa": "colorTokens.blue[400]",
  "#3b82f6": "colorTokens.blue[500]",
  "#2563eb": "colorTokens.blue[600]",
  "#1d4ed8": "colorTokens.blue[700]",
  "#1e40af": "colorTokens.blue[900]",
  "#1e3a8a": "colorTokens.blue[900]",

  // Emerald scale
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

  // Gray scale
  "#f9fafb": "colorTokens.gray[50]",
  "#f3f4f6": "colorTokens.gray[100]",
  "#e5e7eb": "colorTokens.gray[200]",
  "#d1d5db": "colorTokens.gray[300]",
  "#9ca3af": "colorTokens.gray[400]",
  "#6b7280": "colorTokens.gray[500]",
  "#4b5563": "colorTokens.gray[600]",
  "#374151": "colorTokens.gray[700]",
  "#1f2937": "colorTokens.gray[800]",
  "#111827": "colorTokens.gray[900]",

  // Red scale
  "#fef2f2": "colorTokens.red[50]",
  "#fee2e2": "colorTokens.red[100]",
  "#fecaca": "colorTokens.red[200]",
  "#fca5a5": "colorTokens.red[300]",
  "#f87171": "colorTokens.red[400]",
  "#ef4444": "colorTokens.red[500]",
  "#dc2626": "colorTokens.red[600]",
  "#b91c1c": "colorTokens.red[700]",
  "#991b1b": "colorTokens.red[800]",

  // Amber scale
  "#fffbeb": "colorTokens.amber[50]",
  "#fef3c7": "colorTokens.amber[100]",
  "#fde68a": "colorTokens.amber[200]",
  "#fcd34d": "colorTokens.amber[300]",
  "#fbbf24": "colorTokens.amber[400]",
  "#f59e0b": "colorTokens.amber[500]",
  "#d97706": "colorTokens.amber[600]",
  "#b45309": "colorTokens.amber[700]",
  "#92400e": "colorTokens.amber[800]",

  // Purple scale
  "#faf5ff": "colorTokens.purple[50]",
  "#f3e8ff": "colorTokens.purple[100]",
  "#e9d5ff": "colorTokens.purple[200]",
  "#d8b4fe": "colorTokens.purple[300]",
  "#c084fc": "colorTokens.purple[400]",
  "#a855f7": "colorTokens.purple[500]",
  "#9333ea": "colorTokens.purple[600]",
  "#6b21a8": "colorTokens.purple[800]",

  // Cyan scale
  "#ecfeff": "colorTokens.cyan[50]",
  "#cffafe": "colorTokens.cyan[100]",
  "#a5f3fc": "colorTokens.cyan[200]",
  "#67e8f9": "colorTokens.cyan[300]",
  "#22d3ee": "colorTokens.cyan[400]",
  "#06b6d4": "colorTokens.cyan[500]",
  "#0891b2": "colorTokens.cyan[600]",
  "#0e7490": "colorTokens.cyan[700]",

  // Violet scale
  "#f5f3ff": "colorTokens.violet[50]",
  "#ede9fe": "colorTokens.violet[100]",
  "#ddd6fe": "colorTokens.violet[200]",
  "#c4b5fd": "colorTokens.violet[300]",
  "#a78bfa": "colorTokens.violet[400]",
  "#8b5cf6": "colorTokens.violet[500]",
  "#7c3aed": "colorTokens.violet[600]",
  "#be123c": "colorTokens.violet[600]",

  // Special cases
  "#ea580c": "colorTokens.amber[600]", // Orange → closest is amber
  "#22c55e": "colorTokens.emerald[500]", // Green-500 → emerald
  "#ffffff": '"#ffffff"', // Keep pure white as literal
  "#000000": '"#000000"', // Keep pure black as literal (or decide on gray-900)
};

interface Replacement {
  file: string;
  line: number;
  column: number;
  original: string;
  replacement: string;
  context: string;
}

function normalizeHex(hex: string): string {
  return hex.toLowerCase().replace(/\s/g, "");
}

function findHexColorsInFile(
  filePath: string,
  project: Project
): Replacement[] {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return [];

  const replacements: Replacement[] = [];
  const hexRegex = /#[0-9a-fA-F]{6}/g;

  // Get full text to search
  const fullText = sourceFile.getFullText();
  let match: RegExpExecArray | null;

  while ((match = hexRegex.exec(fullText)) !== null) {
    const hex = normalizeHex(match[0]);
    const token = EXACT_HEX_TO_TOKEN[hex];

    if (token) {
      const pos = sourceFile.getLineAndColumnAtPos(match.index);
      const line = sourceFile.getLineAndColumnAtPos(match.index).line;
      const lineText = sourceFile.getFullText().split("\n")[line - 1];

      replacements.push({
        file: filePath,
        line: pos.line,
        column: pos.column,
        original: match[0],
        replacement: token,
        context: lineText.trim(),
      });
    }
  }

  return replacements;
}

function calculateImportPath(filePath: string): string {
  const parts = filePath.split("/");
  const srcIndex = parts.indexOf("src");
  if (srcIndex === -1) return "../../design-system/tokens";

  const depth = parts.length - srcIndex - 2; // -2 for src and filename
  return "../".repeat(depth) + "design-system/tokens";
}

function addColorTokensImport(sourceFile: SourceFile, importPath: string) {
  // Check if import already exists
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
    // Add new import - either after last import or at top of file
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

async function main() {
  const projectRoot = resolve(__dirname, "../..");
  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });

  // Add all source files
  project.addSourceFilesAtPaths("src/**/*.{ts,tsx}");

  // Get all .tsx and .ts files (excluding test files for now)
  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const path = sf.getFilePath();
    return (
      (path.endsWith(".tsx") || path.endsWith(".ts")) &&
      !path.includes(".test.") &&
      !path.includes(".spec.") &&
      !path.includes("node_modules") &&
      !path.includes("/design-system/tokens.ts") && // Don't replace in token definitions
      !path.includes("token-automation")
    ); // Don't replace in automation scripts
  });

  console.log(
    `🔍 Scanning ${sourceFiles.length} files for exact hex matches...\n`
  );

  const allReplacements: Replacement[] = [];
  const fileReplacements = new Map<string, Replacement[]>();

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const replacements = findHexColorsInFile(filePath, project);

    if (replacements.length > 0) {
      allReplacements.push(...replacements);
      fileReplacements.set(filePath, replacements);
    }
  }

  console.log(
    `📊 Found ${allReplacements.length} exact hex matches across ${fileReplacements.size} files\n`
  );

  // Group by file and show summary
  fileReplacements.forEach((replacements, filePath) => {
    const shortPath = filePath.replace(projectRoot, "");
    console.log(`\n📁 ${shortPath} (${replacements.length} matches)`);
    replacements.forEach((r) => {
      console.log(`   Line ${r.line}: ${r.original} → ${r.replacement}`);
      console.log(`   Context: ${r.context}`);
    });
  });

  console.log(`\n\n💡 DRY RUN COMPLETE`);
  console.log(`\nTo apply these changes, run with --apply flag`);
  console.log(
    `   tsx scripts/token-automation/01-replace-exact-hex-matches.ts --apply\n`
  );

  // Apply changes if --apply flag is present
  if (process.argv.includes("--apply")) {
    console.log(`\n🚀 APPLYING CHANGES...\n`);

    for (const [filePath, replacements] of fileReplacements) {
      const sourceFile = project.getSourceFile(filePath);
      if (!sourceFile) continue;

      // Add import if needed
      const importPath = calculateImportPath(filePath);
      addColorTokensImport(sourceFile, importPath);

      // Get full text and replace all occurrences
      let text = sourceFile.getFullText();
      const uniqueReplacements = new Map<string, string>();

      replacements.forEach((r) => {
        uniqueReplacements.set(r.original, r.replacement);
      });

      uniqueReplacements.forEach((replacement, original) => {
        // Only replace in string contexts (not in comments)
        const regex = new RegExp(
          `(['"\`])${original.replace("#", "\\#")}\\1`,
          "g"
        );
        text = text.replace(regex, replacement);
      });

      sourceFile.replaceWithText(text);
      await sourceFile.save();

      console.log(`   ✅ ${filePath.replace(projectRoot, "")}`);
    }

    console.log(
      `\n✨ Applied ${allReplacements.length} replacements to ${fileReplacements.size} files\n`
    );
    console.log(`⚠️  Run 'npm run type-check' to verify changes\n`);
  }
}

main().catch(console.error);
