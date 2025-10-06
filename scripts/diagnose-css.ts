#!/usr/bin/env tsx
/**
 * CSS Diagnostic Tool
 * Identifies issues with CSS token loading and Tailwind configuration
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

function main() {
  console.log("🔍 CSS Diagnostic Report\n");
  console.log("=" .repeat(60));

  const rootDir = process.cwd();
  const checks = [];

  // 1. Check if generated-tokens.css exists and has content
  const tokensPath = join(rootDir, "src/styles/generated-tokens.css");
  if (existsSync(tokensPath)) {
    const tokensContent = readFileSync(tokensPath, "utf-8");
    const variableCount = (tokensContent.match(/--[\w-]+:/g) || []).length;
    const hasSemanticTokens = tokensContent.includes("--semantic-");
    checks.push({
      name: "✅ generated-tokens.css exists",
      detail: `${variableCount} CSS variables found`,
      status: variableCount > 0 ? "PASS" : "FAIL",
    });
    checks.push({
      name: hasSemanticTokens ? "✅ Semantic tokens present" : "❌ Semantic tokens MISSING",
      detail: hasSemanticTokens ? "Found --semantic-* variables" : "No semantic tokens found!",
      status: hasSemanticTokens ? "PASS" : "FAIL",
    });
  } else {
    checks.push({
      name: "❌ generated-tokens.css MISSING",
      detail: "Run: npm run tokens:generate",
      status: "FAIL",
    });
  }

  // 2. Check if index.css imports the tokens
  const indexCssPath = join(rootDir, "src/index.css");
  if (existsSync(indexCssPath)) {
    const indexCss = readFileSync(indexCssPath, "utf-8");
    const importsTokens = indexCss.includes("@import \"./styles/generated-tokens.css\"");
    checks.push({
      name: importsTokens ? "✅ index.css imports tokens" : "❌ index.css MISSING token import",
      detail: importsTokens ? "Import statement found" : "Add: @import \"./styles/generated-tokens.css\";",
      status: importsTokens ? "PASS" : "FAIL",
    });
  }

  // 3. Check Tailwind config
  const tailwindPath = join(rootDir, "tailwind.config.js");
  if (existsSync(tailwindPath)) {
    const tailwindConfig = readFileSync(tailwindPath, "utf-8");
    const hasSemanticColors = tailwindConfig.includes("semanticColor");
    const hasBrandColors = tailwindConfig.includes("brand:");
    checks.push({
      name: hasSemanticColors ? "✅ Tailwind uses semantic tokens" : "❌ Tailwind NOT using tokens",
      detail: hasSemanticColors ? "semanticColor function found" : "Missing token integration",
      status: hasSemanticColors ? "PASS" : "FAIL",
    });
    checks.push({
      name: hasBrandColors ? "✅ Brand color mapping exists" : "⚠️ Brand colors missing",
      detail: hasBrandColors ? "brand.primary, etc. configured" : "May cause styling issues",
      status: hasBrandColors ? "PASS" : "WARN",
    });
  }

  // 4. Check for Vite cache
  const viteCachePath = join(rootDir, "node_modules/.vite");
  const viteCacheExists = existsSync(viteCachePath);
  checks.push({
    name: viteCacheExists ? "⚠️ Vite cache exists" : "✅ Vite cache cleared",
    detail: viteCacheExists ? "May contain stale CSS. Run: rm -rf node_modules/.vite" : "Fresh build",
    status: viteCacheExists ? "WARN" : "PASS",
  });

  // 5. Check main.tsx imports
  const mainPath = join(rootDir, "src/main.tsx");
  if (existsSync(mainPath)) {
    const mainContent = readFileSync(mainPath, "utf-8");
    const importsCss = mainContent.includes("import \"./index.css\"");
    checks.push({
      name: importsCss ? "✅ main.tsx imports index.css" : "❌ main.tsx MISSING CSS import",
      detail: importsCss ? "CSS import found" : "Add: import \"./index.css\";",
      status: importsCss ? "PASS" : "FAIL",
    });
  }

  // Print results
  console.log("\n📊 Check Results:\n");
  checks.forEach((check, index) => {
    const icon = check.status === "PASS" ? "✅" : check.status === "FAIL" ? "❌" : "⚠️";
    console.log(`${index + 1}. ${check.name}`);
    console.log(`   ${check.detail}`);
    console.log(`   Status: ${icon} ${check.status}\n`);
  });

  const failCount = checks.filter((c) => c.status === "FAIL").length;
  const warnCount = checks.filter((c) => c.status === "WARN").length;

  console.log("=" .repeat(60));
  console.log(`\n📈 Summary: ${checks.length - failCount - warnCount}/${checks.length} checks passed`);
  
  if (failCount > 0) {
    console.log(`\n❌ ${failCount} CRITICAL ISSUES found`);
    console.log("\n🔧 Recommended fixes:");
    console.log("   1. Run: npm run tokens:generate");
    console.log("   2. Clear Vite cache: rm -rf node_modules/.vite");
    console.log("   3. Restart dev server: npm run dev:clean");
    console.log("   4. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)");
  } else if (warnCount > 0) {
    console.log(`\n⚠️ ${warnCount} warnings found - may affect styling`);
    console.log("\n💡 Suggested actions:");
    console.log("   • Clear Vite cache: rm -rf node_modules/.vite");
    console.log("   • Restart dev server");
    console.log("   • Check browser console for CSS 404 errors");
  } else {
    console.log("\n✅ All checks passed! CSS configuration looks good.");
    console.log("\n🔍 If styling still looks wrong:");
    console.log("   • Check browser DevTools Console for errors");
    console.log("   • Inspect Elements tab → Computed styles for CSS variables");
    console.log("   • Verify --semantic-* variables are defined");
    console.log("   • Check Network tab for CSS file 404 errors");
  }

  console.log("\n");
}

main();
