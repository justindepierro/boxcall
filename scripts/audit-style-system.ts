#!/usr/bin/env tsx
/**
 * Style System Cleanup & Audit
 *
 * This script:
 * 1. Identifies duplicate CSS definitions
 * 2. Finds legacy token references
 * 3. Checks for conflicting styles
 * 4. Recommends files to delete
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const rootDir = process.cwd();

console.log("🔍 BoxCall Style System Audit\n");
console.log("=".repeat(60));

// Check 1: Duplicate Token Definitions
console.log("\n📋 CHECK 1: Duplicate Token Definitions\n");

const tokenFiles = [
  "src/styles/generated-tokens.css",
  "src/styles/generated-themes.css",
];

const allTokens: Record<string, string[]> = {};

tokenFiles.forEach((file) => {
  const path = join(rootDir, file);
  if (existsSync(path)) {
    const content = readFileSync(path, "utf-8");
    const matches = content.matchAll(/--([a-z-]+):/g);

    for (const match of matches) {
      const token = `--${match[1]}`;
      if (!allTokens[token]) {
        allTokens[token] = [];
      }
      allTokens[token].push(file);
    }
  }
});

const duplicates = Object.entries(allTokens).filter(
  ([_, files]) => files.length > 1
);

if (duplicates.length > 0) {
  console.log(`❌ FOUND ${duplicates.length} DUPLICATE TOKENS:\n`);
  duplicates.slice(0, 10).forEach(([token, files]) => {
    console.log(`   ${token}`);
    files.forEach((f) => console.log(`      - ${f}`));
  });
  if (duplicates.length > 10) {
    console.log(`   ... and ${duplicates.length - 10} more`);
  }
} else {
  console.log("✅ No duplicate tokens found");
}

// Check 2: Legacy References
console.log("\n📋 CHECK 2: Legacy Token References\n");

try {
  const result = execSync(
    'grep -r "var(--spacing-[0-9])" src/ --include="*.css" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l',
    { encoding: "utf-8" }
  );
  const count = parseInt(result.trim());

  if (count > 0) {
    console.log(
      `❌ FOUND ${count} legacy --spacing-* references (should be --space-*)`
    );
  } else {
    console.log("✅ No legacy --spacing-* references found");
  }
} catch (e) {
  console.log("✅ No legacy --spacing-* references found");
}

// Check 3: File Sizes
console.log("\n📋 CHECK 3: CSS File Sizes\n");

const cssFiles = execSync('find src/styles -name "*.css" -type f', {
  encoding: "utf-8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

const fileSizes: Array<{ file: string; size: number }> = [];

cssFiles.forEach((file) => {
  const path = join(rootDir, file);
  if (existsSync(path)) {
    const content = readFileSync(path, "utf-8");
    const size = Buffer.byteLength(content, "utf-8");
    fileSizes.push({ file: file.replace(rootDir + "/", ""), size });
  }
});

fileSizes.sort((a, b) => b.size - a.size);

console.log("Largest CSS files:");
fileSizes.slice(0, 5).forEach(({ file, size }) => {
  const kb = (size / 1024).toFixed(1);
  console.log(`   ${file}: ${kb} KB`);
});

const totalSize = fileSizes.reduce((sum, f) => sum + f.size, 0);
console.log(`\n📊 Total CSS size: ${(totalSize / 1024).toFixed(1)} KB`);

// Check 4: Import Order
console.log("\n📋 CHECK 4: CSS Import Order\n");

const indexCssPath = join(rootDir, "src/index.css");
if (existsSync(indexCssPath)) {
  const content = readFileSync(indexCssPath, "utf-8");
  const imports = content.match(/@import "[^"]+";/g) || [];

  console.log("Current import order:");
  imports.forEach((imp, i) => {
    console.log(`   ${i + 1}. ${imp}`);
  });

  // Check if tokens come before Tailwind
  const tokenIndex = imports.findIndex((i) =>
    i.includes("generated-tokens.css")
  );
  const tailwindIndex = content.indexOf("@tailwind base");

  if (tokenIndex >= 0 && tailwindIndex >= 0 && tokenIndex < tailwindIndex) {
    console.log("\n✅ Tokens loaded before Tailwind (correct order)");
  } else {
    console.log("\n⚠️  Import order may need review");
  }
}

// Check 5: Recommendations
console.log("\n📋 RECOMMENDATIONS\n");

console.log("1. 🗑️  REMOVE LEGACY FILES:");
console.log("   - src/themes/build-themes.ts (legacy theme system)");
console.log("   - src/themes/registry.ts (if it exists)");
console.log(
  "   - src/styles/generated-themes.css (duplicates generated-tokens.css)"
);

console.log("\n2. 📝 UPDATE IMPORTS:");
console.log("   - Remove @import for generated-themes.css from src/index.css");
console.log("   - Keep only generated-tokens.css as single source of truth");

console.log("\n3. ✨ OPTIMIZE:");
console.log("   - Consider combining small CSS files (<2KB) into index.css");
console.log("   - Enable CSS minification in production build");
console.log("   - Use PurgeCSS/Tailwind purge to remove unused utilities");

console.log("\n4. 🧪 TEST:");
console.log("   - After cleanup, run: npm run tokens:generate");
console.log("   - Clear cache: rm -rf node_modules/.vite");
console.log("   - Restart: npm run dev");
console.log("   - Hard refresh browser: Cmd+Shift+R");

console.log("\n" + "=".repeat(60));
console.log("\n💡 Run cleanup script? See: scripts/cleanup-legacy-styles.ts\n");
