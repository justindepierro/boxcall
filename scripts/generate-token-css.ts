#!/usr/bin/env tsx
/**
 * Generate CSS custom properties from design tokens
 * 
 * This script reads the design token definitions and generates
 * CSS custom properties (CSS variables) for use throughout the app.
 * 
 * Usage: tsx scripts/generate-token-css.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";
import {
  colorTokens,
  semanticTokens,
  opacityTokens,
  borderRadiusTokens,
  semanticBorderRadiusTokens,
  spacingTokens,
  fineSpacingTokens,
  semanticSpacingTokens,
  elevationTokens,
} from "../src/design-system/tokens.js";

interface CSSVars {
  [key: string]: string;
}

/**
 * Generate CSS custom properties from tokens
 */
function generateCSSCustomProperties(): string {
  const cssVars: CSSVars = {};

  // ============================================================================
  // COLOR TOKENS
  // ============================================================================

  // Add color scale tokens
  Object.entries(colorTokens).forEach(([colorName, colorScale]) => {
    if (typeof colorScale === "object") {
      Object.entries(colorScale).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value;
      });
    }
  });

  // Add semantic color tokens
  Object.entries(semanticTokens).forEach(([key, value]) => {
    if (typeof value === "string") {
      cssVars[`--color-${key}`] = value;
    } else if (typeof value === "object") {
      // Handle nested objects like diagram
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        cssVars[`--color-${key}-${nestedKey}`] = nestedValue as string;
      });
    }
  });

  // ============================================================================
  // OPACITY TOKENS
  // ============================================================================

  Object.entries(opacityTokens).forEach(([key, value]) => {
    cssVars[`--opacity-${key}`] = value;
  });

  // ============================================================================
  // SPACING TOKENS
  // ============================================================================

  // Standard spacing scale
  Object.entries(spacingTokens).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Fine-grained spacing
  Object.entries(fineSpacingTokens).forEach(([key, value]) => {
    cssVars[`--spacing-fine-${key}`] = value;
  });

  // Semantic spacing
  Object.entries(semanticSpacingTokens).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // ============================================================================
  // BORDER RADIUS TOKENS
  // ============================================================================

  Object.entries(borderRadiusTokens).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });

  // Semantic border radius
  Object.entries(semanticBorderRadiusTokens).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });

  // ============================================================================
  // ELEVATION TOKENS
  // ============================================================================

  Object.entries(elevationTokens).forEach(([key, value]) => {
    if (typeof value === "string") {
      cssVars[`--elevation-${key}`] = value;
    } else if (typeof value === "object") {
      // Handle nested elevation tokens (card, button, etc.)
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        cssVars[`--elevation-${key}-${nestedKey}`] = nestedValue;
      });
    }
  });

  // ============================================================================
  // GENERATE CSS FILE CONTENT
  // ============================================================================

  const cssLines = [
    "/**",
    " * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY",
    " * ",
    " * This file is generated from src/design-system/tokens.ts",
    " * Run: npm run tokens:generate",
    " * ",
    " * Last generated: " + new Date().toISOString(),
    " */",
    "",
    ":root {",
  ];

  // Sort CSS variables for better readability
  const sortedVars = Object.entries(cssVars).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  sortedVars.forEach(([varName, value]) => {
    cssLines.push(`  ${varName}: ${value};`);
  });

  cssLines.push("}");
  cssLines.push(""); // trailing newline

  return cssLines.join("\n");
}

/**
 * Main execution
 */
function main() {
  console.log("🎨 Generating CSS custom properties from design tokens...");

  const cssContent = generateCSSCustomProperties();
  const outputPath = join(
    process.cwd(),
    "src/styles/generated-tokens.css"
  );

  writeFileSync(outputPath, cssContent, "utf-8");

  console.log(`✅ Generated ${outputPath}`);
  console.log(`📊 Generated ${cssContent.split("\n").length} lines of CSS`);
  console.log(
    `🎯 Total CSS variables: ${Object.keys(cssContent.match(/--[\w-]+:/g) || []).length}`
  );
}

main();
