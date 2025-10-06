#!/usr/bin/env tsx
/**
 * Cleanup Legacy Style System
 * 
 * DANGER: This script removes files! Review changes before running.
 * 
 * Actions:
 * 1. Remove legacy theme generation system
 * 2. Remove duplicate generated-themes.css
 * 3. Update index.css to remove redundant import
 * 4. Backup files before deletion
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();
const backupDir = join(rootDir, ".cleanup-backup");

console.log("🧹 BoxCall Style System Cleanup\n");
console.log("=".repeat(60));

// Create backup directory
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
  console.log(`✅ Created backup directory: ${backupDir}\n`);
}

const filesToRemove = [
  "src/themes/build-themes.ts",
  "src/themes/registry.ts",
  "src/styles/generated-themes.css",
];

const filesToUpdate = [
  "src/index.css",
];

// Step 1: Backup files before deletion
console.log("📦 Backing up files...\n");

filesToRemove.forEach((file) => {
  const sourcePath = join(rootDir, file);
  if (existsSync(sourcePath)) {
    const backupPath = join(backupDir, file.replace(/\//g, "_"));
    copyFileSync(sourcePath, backupPath);
    console.log(`   ✅ Backed up: ${file}`);
  } else {
    console.log(`   ⚠️  Not found: ${file}`);
  }
});

// Step 2: Remove legacy files
console.log("\n🗑️  Removing legacy files...\n");

let removedCount = 0;

filesToRemove.forEach((file) => {
  const filePath = join(rootDir, file);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    console.log(`   ✅ Removed: ${file}`);
    removedCount++;
  }
});

console.log(`\n   Removed ${removedCount} files`);

// Step 3: Update index.css
console.log("\n📝 Updating src/index.css...\n");

const indexCssPath = join(rootDir, "src/index.css");
if (existsSync(indexCssPath)) {
  let content = readFileSync(indexCssPath, "utf-8");
  
  // Remove the commented-out old import
  content = content.replace(
    /\/\* @import "\.\/styles\/tokens\.css"; \*\/ \/\* Removed.*?\*\/\n/g,
    ""
  );
  
  // Remove generated-themes.css import
  const beforeChange = content;
  content = content.replace(
    /@import "\.\/styles\/generated-themes\.css";\n/g,
    ""
  );
  
  if (content !== beforeChange) {
    writeFileSync(indexCssPath, content, "utf-8");
    console.log("   ✅ Removed generated-themes.css import");
    console.log("   ✅ Removed obsolete comment");
  } else {
    console.log("   ℹ️  No changes needed");
  }
} else {
  console.log("   ❌ src/index.css not found!");
}

// Step 4: Cleanup empty directories
console.log("\n🧹 Cleaning up empty directories...\n");

const themesDir = join(rootDir, "src/themes");
if (existsSync(themesDir)) {
  try {
    const fs = require("fs");
    const files = fs.readdirSync(themesDir);
    if (files.length === 0) {
      fs.rmdirSync(themesDir);
      console.log("   ✅ Removed empty src/themes directory");
    } else {
      console.log(`   ℹ️  src/themes still has ${files.length} files`);
    }
  } catch (e) {
    console.log("   ⚠️  Could not remove src/themes directory");
  }
}

// Step 5: Summary
console.log("\n" + "=".repeat(60));
console.log("\n✅ CLEANUP COMPLETE!\n");

console.log("📊 Summary:");
console.log(`   • Removed ${removedCount} legacy files`);
console.log(`   • Updated src/index.css`);
console.log(`   • Backups saved to: ${backupDir}`);

console.log("\n🔄 NEXT STEPS:\n");
console.log("   1. Regenerate tokens:");
console.log("      npm run tokens:generate");
console.log("\n   2. Clear Vite cache:");
console.log("      rm -rf node_modules/.vite");
console.log("\n   3. Restart dev server:");
console.log("      npm run dev");
console.log("\n   4. Hard refresh browser:");
console.log("      Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)");

console.log("\n💾 To restore backup:");
console.log(`   cp ${backupDir}/* to original locations`);

console.log("\n");
