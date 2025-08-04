#!/usr/bin/env node

/**
 * Script to update Navigation component with centralized design tokens
 * Replaces hardcoded jade/navy colors with token-based classes
 */

const fs = require("fs");
const path = require("path");

const navigationPath = path.join(
  __dirname,
  "../src/components/ui/Navigation.tsx"
);

console.log("🎨 Updating Navigation component with design tokens...");

// Read the file
let content = fs.readFileSync(navigationPath, "utf8");

// Define replacement patterns
const replacements = [
  // Hover text colors
  {
    search: "hover:text-jade-600 dark:hover:text-jade-400",
    replace: "hover:text-interaction-jade dark:hover:text-brand-jade",
  },
  // Hover background colors
  {
    search: "hover:bg-jade-50 dark:hover:bg-jade-900/10",
    replace: "hover:bg-surface-jade dark:hover:bg-surface-jade-dark",
  },
  // Hover border colors
  {
    search: "hover:border-jade-200",
    replace: "hover:border-surface-jade-dark",
  },
  {
    search: "hover:border-jade-500",
    replace: "hover:border-brand-jade",
  },
  // Text colors for brand
  {
    search: "text-jade-600 dark:text-jade-400",
    replace: "text-interaction-jade dark:text-brand-jade",
  },
  // Mobile menu specific patterns
  {
    search:
      "hover:bg-jade-100 hover:text-jade-700 dark:hover:bg-jade-900/20 dark:hover:text-jade-400",
    replace:
      "hover:bg-surface-jade hover:text-interaction-jade dark:hover:bg-surface-jade-dark dark:hover:text-brand-jade",
  },
];

// Apply replacements
let changeCount = 0;
replacements.forEach(({ search, replace }) => {
  const before = content;
  content = content.replaceAll(search, replace);
  if (content !== before) {
    const matches = (
      before.match(
        new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
      ) || []
    ).length;
    console.log(`✅ Replaced "${search}" (${matches} instances)`);
    changeCount += matches;
  }
});

// Write the updated file
if (changeCount > 0) {
  fs.writeFileSync(navigationPath, content);
  console.log(
    `🎉 Updated Navigation component with ${changeCount} token replacements!`
  );
} else {
  console.log("ℹ️  No jade/navy patterns found to replace.");
}

console.log("✅ Navigation component migration complete!");
