#!/usr/bin/env node

/**
 * Script to update remaining legal pages and other components
 * Phase 4D: Final cleanup of remaining hardcoded colors
 */

const fs = require("fs");
const path = require("path");

console.log("🎨 Phase 4D: Final cleanup of remaining hardcoded colors...");

// Files to update
const filesToUpdate = [
  "src/pages/legal/AboutPage.tsx",
  "src/pages/legal/ContactPage.tsx",
];

// Define replacement patterns for remaining jade/navy colors
const replacements = [
  // Text colors
  {
    search: "text-jade-600",
    replace: "text-interaction-jade",
  },
  {
    search: "text-jade-700",
    replace: "text-brand-jade-dark",
  },
  {
    search: "hover:text-jade-700",
    replace: "hover:text-brand-jade-dark",
  },
  // Background colors
  {
    search: "bg-jade-100",
    replace: "bg-surface-jade",
  },
  {
    search: "bg-jade-600",
    replace: "bg-interaction-jade",
  },
  {
    search: "hover:bg-jade-700",
    replace: "hover:bg-brand-jade-dark",
  },
  {
    search: "bg-jade-900",
    replace: "bg-surface-jade-dark",
  },
  // Focus states
  {
    search: "focus:ring-jade-500",
    replace: "focus:ring-brand-jade",
  },
  {
    search: "focus:border-jade-500",
    replace: "focus:border-brand-jade",
  },
];

let totalChanges = 0;

filesToUpdate.forEach((relativePath) => {
  const filePath = path.join(__dirname, "..", relativePath);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }

  console.log(`\n📝 Processing: ${relativePath}`);

  // Read the file
  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;

  // Apply replacements
  replacements.forEach(({ search, replace }) => {
    const before = content;
    content = content.replaceAll(search, replace);
    if (content !== before) {
      const matches = (
        before.match(
          new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
        ) || []
      ).length;
      console.log(`  ✅ ${search} → ${replace} (${matches} instances)`);
      fileChanges += matches;
    }
  });

  // Write the updated file if changes were made
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(
      `  📄 Updated ${relativePath} with ${fileChanges} token replacements`
    );
    totalChanges += fileChanges;
  } else {
    console.log(`  ℹ️  No jade/navy patterns found in ${relativePath}`);
  }
});

console.log(
  `\n🎉 Phase 4D Complete! Updated ${totalChanges} hardcoded color references.`
);
console.log("✅ All legal pages now use centralized design tokens!");
