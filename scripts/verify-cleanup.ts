#!/usr/bin/env tsx
/**
 * Post-Cleanup Verification
 * Confirms the style system is clean and optimized
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();

console.log("🔍 Post-Cleanup Verification\n");
console.log("=".repeat(60));

let allGood = true;
const issues: string[] = [];
const passed: string[] = [];

// Check 1: Legacy files should NOT exist
console.log("\n✓ Check 1: Legacy Files Removed");
const legacyFiles = [
  "src/themes/build-themes.ts",
  "src/themes/registry.ts",
  "src/styles/generated-themes.css",
];

legacyFiles.forEach(file => {
  const path = join(rootDir, file);
  if (existsSync(path)) {
    issues.push(`❌ Legacy file still exists: ${file}`);
    allGood = false;
  } else {
    passed.push(`✅ ${file} removed`);
  }
});

// Check 2: Generated tokens should exist
console.log("\n✓ Check 2: Token Generation");
const generatedTokensPath = join(rootDir, "src/styles/generated-tokens.css");
if (existsSync(generatedTokensPath)) {
  const content = readFileSync(generatedTokensPath, "utf-8");
  const variables = (content.match(/--[\w-]+:/g) || []).length;
  
  if (variables >= 200) {
    passed.push(`✅ generated-tokens.css exists with ${variables} variables`);
  } else {
    issues.push(`⚠️  generated-tokens.css has only ${variables} variables (expected 200+)`);
  }
} else {
  issues.push("❌ generated-tokens.css is missing!");
  allGood = false;
}

// Check 3: index.css should NOT import generated-themes
console.log("\n✓ Check 3: CSS Imports");
const indexCssPath = join(rootDir, "src/index.css");
if (existsSync(indexCssPath)) {
  const content = readFileSync(indexCssPath, "utf-8");
  
  if (content.includes("generated-themes.css")) {
    issues.push("❌ index.css still imports generated-themes.css");
    allGood = false;
  } else {
    passed.push("✅ index.css does not import legacy theme file");
  }
  
  if (content.includes("generated-tokens.css")) {
    passed.push("✅ index.css imports generated-tokens.css");
  } else {
    issues.push("❌ index.css missing generated-tokens.css import");
    allGood = false;
  }
}

// Check 4: Tailwind config should use --space-* not --spacing-*
console.log("\n✓ Check 4: Tailwind Config");
const tailwindConfigPath = join(rootDir, "tailwind.config.js");
if (existsSync(tailwindConfigPath)) {
  const content = readFileSync(tailwindConfigPath, "utf-8");
  
  const hasCorrectSpacing = content.includes('var(--space-2)');
  const hasWrongSpacing = content.includes('var(--spacing-2)') && !content.includes('var(--spacing-');
  
  if (hasCorrectSpacing && !hasWrongSpacing) {
    passed.push("✅ Tailwind config uses correct --space-* variables");
  } else if (hasWrongSpacing) {
    issues.push("❌ Tailwind config still uses wrong --spacing-* variables");
    allGood = false;
  }
}

// Check 5: Custom plugins should exist
console.log("\n✓ Check 5: Tailwind Plugins");
const boxcallThemePath = join(rootDir, "src/styles/tailwind/boxcallTheme.js");
if (existsSync(boxcallThemePath)) {
  const content = readFileSync(boxcallThemePath, "utf-8");
  
  if (content.includes("export default")) {
    passed.push("✅ boxcallTheme.js uses ESM exports");
  } else {
    issues.push("⚠️  boxcallTheme.js may still use CommonJS");
  }
  
  if (content.includes("addUtilities")) {
    passed.push("✅ boxcallTheme.js generates utilities");
  }
} else {
  issues.push("❌ boxcallTheme.js is missing");
  allGood = false;
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 Verification Results");
console.log("=".repeat(60));

if (allGood && issues.length === 0) {
  console.log("\n🎉 ALL CHECKS PASSED!\n");
  passed.forEach(msg => console.log(`   ${msg}`));
  
  console.log("\n✅ Style system is clean and optimized!");
  console.log("\n📝 Next steps:");
  console.log("   1. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)");
  console.log("   2. Verify styling looks correct");
  console.log("   3. Test responsive breakpoints");
  console.log("   4. Run production build: npm run build");
  
} else {
  console.log("\n⚠️  ISSUES FOUND:\n");
  issues.forEach(msg => console.log(`   ${msg}`));
  
  if (passed.length > 0) {
    console.log("\n✅ Passed:\n");
    passed.forEach(msg => console.log(`   ${msg}`));
  }
  
  console.log("\n🔧 Action required: Review issues above");
}

console.log("\n");

process.exit(allGood && issues.length === 0 ? 0 : 1);
