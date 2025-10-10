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
import { generateTokensCSS } from "./lib/generateTokens";

function main() {
  console.log("🎨 Generating CSS custom properties from design tokens...");

  const cssContent = generateTokensCSS();
  const outputPath = join(process.cwd(), "src/styles/generated-tokens.css");

  writeFileSync(outputPath, cssContent, "utf-8");

  console.log(`✅ Generated ${outputPath}`);
  console.log(`📊 Generated ${cssContent.split("\n").length} lines of CSS`);
  console.log(
    `🎯 Total CSS variables: ${(cssContent.match(/--[\w-]+:/g) || []).length}`
  );
}

main();
