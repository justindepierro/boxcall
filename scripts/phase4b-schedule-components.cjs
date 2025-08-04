#!/usr/bin/env node

/**
 * Script to update Schedule Manager and Calendar components
 * Phase 4 continued: Complex feature components
 */

const fs = require("fs");
const path = require("path");

console.log(
  "🎨 Phase 4B: Updating Schedule Manager and Calendar components..."
);

// Files to update
const filesToUpdate = ["src/components/schedule/GameScheduleManager.tsx"];

// Define replacement patterns for jade/navy colors in schedule components
const replacements = [
  // Navy colors for text and backgrounds
  {
    search: "text-navy-900",
    replace: "text-brand-navy-dark",
  },
  {
    search: "text-navy-800",
    replace: "text-brand-navy",
  },
  {
    search: "text-navy-600",
    replace: "text-interaction-navy",
  },
  {
    search: "bg-navy-50",
    replace: "bg-surface-navy",
  },
  // Jade colors for buttons and highlights
  {
    search: "bg-jade-600",
    replace: "bg-interaction-jade",
  },
  {
    search: "hover:bg-jade-700",
    replace: "hover:bg-brand-jade-dark",
  },
  {
    search: "bg-jade-50",
    replace: "bg-surface-jade",
  },
  {
    search: "bg-jade-100",
    replace: "bg-surface-jade",
  },
  {
    search: "text-jade-800",
    replace: "text-brand-jade-dark",
  },
  {
    search: "text-jade-600",
    replace: "text-interaction-jade",
  },
  // Focus and border states for form inputs
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
  `\n🎉 Phase 4B Complete! Updated ${totalChanges} hardcoded color references.`
);
console.log("✅ Schedule Manager now uses centralized design tokens!");
