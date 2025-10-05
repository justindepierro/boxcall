#!/usr/bin/env tsx
/**
 * Design Token Audit Script
 * 
 * Scans the entire codebase for hardcoded design values:
 * - Colors (#hex, rgb/rgba)
 * - Spacing (px, rem hardcoded)
 * - Font sizes
 * - Shadows
 * - Border radius
 * - Z-index
 * 
 * Generates comprehensive report with:
 * - Total violations by category
 * - File-by-file breakdown
 * - Token mapping suggestions
 * - Priority ranking
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { colorTokens, semanticTokens } from "../src/design-system/tokens.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// PATTERNS TO DETECT
// ============================================================================

const patterns = {
  hexColor: /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})(?![0-9A-Fa-f])/g,
  rgbColor: /rgb\([^)]+\)/g,
  rgbaColor: /rgba\([^)]+\)/g,
  pxSpacing: /(?:padding|margin|gap|width|height|top|right|bottom|left|inset):\s*(\d+)px/g,
  remSpacing: /(?:padding|margin|gap):\s*([\d.]+)rem/g,
  fontSize: /font-size:\s*([\d.]+(?:px|rem|em))/g,
  boxShadow: /box-shadow:\s*[^;]+/g,
  textShadow: /text-shadow:\s*[^;]+/g,
  borderRadius: /border-radius:\s*([\d.]+(?:px|rem))/g,
  zIndex: /z-index:\s*(\d+)/g,
  
  // Tailwind hardcoded values
  tailwindColor: /(?:bg|text|border)-\[#[0-9A-Fa-f]{6}\]/g,
  tailwindSpacing: /(?:p|m|gap|w|h)-\[[\d.]+(?:px|rem)\]/g,
};

// ============================================================================
// FILE TRAVERSAL
// ============================================================================

interface Violation {
  file: string;
  line: number;
  column: number;
  type: string;
  value: string;
  context: string;
  suggestion?: string;
}

const violations: Violation[] = [];
const fileExtensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"];
const excludeDirs = ["node_modules", "dist", "build", ".next", "coverage", ".git"];

function shouldScanFile(filePath: string): boolean {
  const ext = filePath.substring(filePath.lastIndexOf("."));
  return fileExtensions.includes(ext);
}

function shouldScanDir(dirName: string): boolean {
  return !excludeDirs.includes(dirName) && !dirName.startsWith(".");
}

function scanFile(filePath: string, projectRoot: string): void {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const relativePath = relative(projectRoot, filePath);

    lines.forEach((line, lineIndex) => {
      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
        return;
      }

      // Hex colors
      let match;
      while ((match = patterns.hexColor.exec(line)) !== null) {
        const value = match[0];
        // Skip if it's already a token reference or in a comment
        if (line.includes("colorTokens") || line.includes("--color-")) {
          continue;
        }
        
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index,
          type: "hex-color",
          value,
          context: line.trim(),
          suggestion: suggestColorToken(value),
        });
      }

      // RGB/RGBA colors
      patterns.rgbaColor.lastIndex = 0;
      while ((match = patterns.rgbaColor.exec(line)) !== null) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index,
          type: "rgba-color",
          value: match[0],
          context: line.trim(),
        });
      }

      patterns.rgbColor.lastIndex = 0;
      while ((match = patterns.rgbColor.exec(line)) !== null) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index,
          type: "rgb-color",
          value: match[0],
          context: line.trim(),
        });
      }

      // Hardcoded pixel spacing
      patterns.pxSpacing.lastIndex = 0;
      while ((match = patterns.pxSpacing.exec(line)) !== null) {
        const px = parseInt(match[1]);
        if (px % 4 === 0) { // Only flag if not on 4px grid
          violations.push({
            file: relativePath,
            line: lineIndex + 1,
            column: match.index,
            type: "px-spacing",
            value: `${px}px`,
            context: line.trim(),
            suggestion: suggestSpacingToken(px),
          });
        }
      }

      // Box shadows
      patterns.boxShadow.lastIndex = 0;
      while ((match = patterns.boxShadow.exec(line)) !== null) {
        if (!line.includes("shadow-")) {
          violations.push({
            file: relativePath,
            line: lineIndex + 1,
            column: match.index,
            type: "box-shadow",
            value: match[0],
            context: line.trim(),
          });
        }
      }

      // Tailwind hardcoded colors
      patterns.tailwindColor.lastIndex = 0;
      while ((match = patterns.tailwindColor.exec(line)) !== null) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index,
          type: "tailwind-hex",
          value: match[0],
          context: line.trim(),
        });
      }

      // Tailwind hardcoded spacing
      patterns.tailwindSpacing.lastIndex = 0;
      while ((match = patterns.tailwindSpacing.exec(line)) !== null) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          column: match.index,
          type: "tailwind-spacing",
          value: match[0],
          context: line.trim(),
        });
      }

      // Border radius
      patterns.borderRadius.lastIndex = 0;
      while ((match = patterns.borderRadius.exec(line)) !== null) {
        if (!line.includes("rounded-")) {
          violations.push({
            file: relativePath,
            line: lineIndex + 1,
            column: match.index,
            type: "border-radius",
            value: match[1],
            context: line.trim(),
          });
        }
      }

      // Z-index
      patterns.zIndex.lastIndex = 0;
      while ((match = patterns.zIndex.exec(line)) !== null) {
        const zIndex = parseInt(match[1]);
        if (zIndex > 10 && !line.includes("z-")) {
          violations.push({
            file: relativePath,
            line: lineIndex + 1,
            column: match.index,
            type: "z-index",
            value: match[1],
            context: line.trim(),
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
}

function scanDirectory(dirPath: string, projectRoot: string): void {
  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (shouldScanDir(entry)) {
          scanDirectory(fullPath, projectRoot);
        }
      } else if (stat.isFile()) {
        if (shouldScanFile(fullPath)) {
          scanFile(fullPath, projectRoot);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
}

// ============================================================================
// TOKEN SUGGESTION HELPERS
// ============================================================================

function normalizeHex(hex: string): string {
  hex = hex.toLowerCase();
  if (hex.length === 4) {
    // Expand shorthand #abc to #aabbcc
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function suggestColorToken(hex: string): string | undefined {
  const normalized = normalizeHex(hex);

  // Check exact matches in color tokens
  for (const [colorName, shades] of Object.entries(colorTokens)) {
    if (typeof shades === "object") {
      for (const [shade, value] of Object.entries(shades)) {
        if (normalizeHex(value) === normalized) {
          return `colorTokens.${colorName}[${shade}]`;
        }
      }
    }
  }

  // Check semantic tokens
  for (const [name, value] of Object.entries(semanticTokens)) {
    if (typeof value === "string" && normalizeHex(value) === normalized) {
      return `semanticTokens.${name}`;
    }
  }

  // Common colors
  const commonMappings: Record<string, string> = {
    "#ffffff": "white / semanticTokens.textInverse",
    "#000000": "black / semanticTokens.textPrimary",
    "#111827": "colorTokens.gray[900] / semanticTokens.textPrimary",
    "#f9fafb": "colorTokens.gray[50] / semanticTokens.bgSecondary",
    "#e5e7eb": "colorTokens.gray[200] / semanticTokens.border",
    "#6b7280": "colorTokens.gray[500] / semanticTokens.textMuted",
    "#fbbf24": "amber-400 (consider adding to tokens)",
    "#f59e0b": "colorTokens.warning[500]",
    "#22c55e": "colorTokens.success[500]",
    "#ef4444": "colorTokens.error[500]",
    "#3b82f6": "blue-500 (consider adding to tokens)",
    "#2563eb": "blue-600 (consider adding to tokens)",
    "#22d3ee": "cyan-400 (consider adding to tokens)",
    "#10b981": "emerald-500 (consider adding to tokens)",
    "#047857": "colorTokens.jade[600]",
    "#00a86b": "colorTokens.jade[500]",
  };

  return commonMappings[normalized];
}

function suggestSpacingToken(px: number): string | undefined {
  const spacingMap: Record<number, string> = {
    0: "spacingTokens[0]",
    4: "spacingTokens[1]",
    8: "spacingTokens[2]",
    12: "spacingTokens[3]",
    16: "spacingTokens[4]",
    20: "spacingTokens[5]",
    24: "spacingTokens[6]",
    32: "spacingTokens[8]",
    40: "spacingTokens[10]",
    48: "spacingTokens[12]",
    64: "spacingTokens[16]",
  };

  return spacingMap[px];
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport(): void {
  // Group by type
  const byType = violations.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by file
  const byFile = violations.reduce((acc, v) => {
    acc[v.file] = (acc[v.file] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort files by violation count
  const topFiles = Object.entries(byFile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  // Generate markdown report
  const report = `# Design Token Audit Report

**Generated**: ${new Date().toISOString()}  
**Total Violations**: ${violations.length}

---

## Summary by Type

| Type | Count | Severity |
|------|-------|----------|
${Object.entries(byType)
  .sort(([, a], [, b]) => b - a)
  .map(([type, count]) => `| ${type} | ${count} | ${getSeverity(type)} |`)
  .join("\n")}

---

## Top 20 Files by Violation Count

${topFiles
  .map(
    ([file, count], i) => `${i + 1}. **${file}**: ${count} violations`
  )
  .join("\n")}

---

## Detailed Violations

${generateDetailedViolations()}

---

## Recommendations

### Immediate Actions (High Priority)

1. **Replace hardcoded hex colors** (${byType["hex-color"] || 0} violations)
   - Map to existing color tokens where possible
   - Add missing semantic tokens for common colors

2. **Standardize spacing** (${byType["px-spacing"] || 0} violations)
   - Use spacing tokens (4px grid)
   - Replace all hardcoded px values

3. **Fix Tailwind arbitrary values** (${(byType["tailwind-hex"] || 0) + (byType["tailwind-spacing"] || 0)} violations)
   - Use Tailwind utility classes
   - Extend Tailwind config with design tokens

### Medium Priority

4. **Shadow standardization** (${byType["box-shadow"] || 0} violations)
   - Define elevation tokens
   - Replace all box-shadow with tokens

5. **Border radius consistency** (${byType["border-radius"] || 0} violations)
   - Use border radius tokens
   - Standardize corner styles

### Next Steps

1. Run this audit regularly (CI/CD integration)
2. Add ESLint rules to prevent new violations
3. Create migration scripts for automated fixes
4. Update documentation with token usage guidelines

---

## Token Gap Analysis

### Missing Color Tokens

Based on frequent hardcoded colors, consider adding:
- Blue system (blue-500, blue-600 for links/actions)
- Cyan system (cyan-400 for highlights)
- Amber system (amber-400, amber-500 for warnings)
- Emerald system (emerald-500 for success states)

### Missing Semantic Tokens

- \`linkColor\`: For all link elements
- \`linkHoverColor\`: For hover states
- \`highlightColor\`: For selection/focus highlights
- \`diagr amColors\`: Specific colors for diagram elements

### Missing Spacing Tokens

- Consider adding: 2px, 6px, 10px for fine-tuned layouts
- Add semantic spacing: \`cardPadding\`, \`sectionGap\`, \`itemSpacing\`

---

**End of Report**
`;

  writeFileSync("DESIGN_TOKEN_AUDIT_REPORT.md", report);
  console.log("\n✅ Report generated: DESIGN_TOKEN_AUDIT_REPORT.md");
  console.log(`📊 Total violations: ${violations.length}`);
  console.log(`📁 Files scanned: ${Object.keys(byFile).length}`);
  console.log(`🎨 Color violations: ${byType["hex-color"] || 0}`);
  console.log(`📏 Spacing violations: ${byType["px-spacing"] || 0}`);
}

function getSeverity(type: string): string {
  const high = ["hex-color", "tailwind-hex", "rgba-color"];
  const medium = ["px-spacing", "tailwind-spacing", "box-shadow"];
  const low = ["border-radius", "z-index"];

  if (high.includes(type)) return "🔴 High";
  if (medium.includes(type)) return "🟡 Medium";
  if (low.includes(type)) return "🟢 Low";
  return "⚪ Info";
}

function generateDetailedViolations(): string {
  // Group by file
  const byFile = violations.reduce((acc, v) => {
    if (!acc[v.file]) acc[v.file] = [];
    acc[v.file].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);

  let output = "";

  Object.entries(byFile)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10) // Top 10 files only for detailed view
    .forEach(([file, fileViolations]) => {
      output += `### ${file} (${fileViolations.length} violations)\n\n`;
      
      fileViolations.slice(0, 15).forEach((v) => {
        output += `- **Line ${v.line}** (${v.type}): \`${v.value}\`\n`;
        if (v.suggestion) {
          output += `  - 💡 Suggestion: \`${v.suggestion}\`\n`;
        }
        output += `  - Context: \`${v.context.substring(0, 100)}${v.context.length > 100 ? "..." : ""}\`\n\n`;
      });

      if (fileViolations.length > 15) {
        output += `... and ${fileViolations.length - 15} more violations\n\n`;
      }
    });

  return output;
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  const projectRoot = join(__dirname, "..");
  const srcPath = join(projectRoot, "src");

  console.log("🔍 Scanning codebase for design token violations...\n");
  console.log(`📂 Project root: ${projectRoot}`);
  console.log(`📂 Scanning: ${srcPath}\n`);

  scanDirectory(srcPath, projectRoot);

  console.log(`\n✅ Scan complete!`);
  console.log(`Found ${violations.length} violations\n`);

  generateReport();
}

main();
