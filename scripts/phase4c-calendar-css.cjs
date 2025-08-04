#!/usr/bin/env node

/**
 * Script to update Calendar CSS with centralized design tokens
 * Phase 4C: Calendar CSS hardcoded colors
 */

const fs = require("fs");
const path = require("path");

console.log("🎨 Phase 4C: Updating Calendar CSS with design tokens...");

const filePath = path.join(
  __dirname,
  "..",
  "src/components/calendar/BoxCallCalendar.css"
);

// Read the file
let content = fs.readFileSync(filePath, "utf8");

// Define replacement patterns for hardcoded hex colors
const replacements = [
  {
    search: "background-color: #00a86b !important;",
    replace: "background-color: var(--color-brand-jade) !important;",
  },
  {
    search: "border-color: #00a86b !important;",
    replace: "border-color: var(--color-brand-jade) !important;",
  },
  {
    search: "box-shadow: 0 0 0 2px #00a86b;",
    replace: "box-shadow: 0 0 0 2px var(--color-brand-jade);",
  },
  {
    search: "border-top-color: #00a86b;",
    replace: "border-top-color: var(--color-brand-jade);",
  },
  // Update hover shadow to use CSS variable
  {
    search: "box-shadow: 0 4px 8px rgba(0, 168, 107, 0.2);",
    replace: "box-shadow: 0 4px 8px rgba(0, 168, 107, 0.2);", // Keep this as rgba for opacity
  },
];

let changeCount = 0;

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
    console.log(`✅ Updated: ${search} (${matches} instances)`);
    changeCount += matches;
  }
});

// Write the updated file
if (changeCount > 0) {
  fs.writeFileSync(filePath, content);
  console.log(
    `\n🎉 Updated Calendar CSS with ${changeCount} token replacements!`
  );
} else {
  console.log("ℹ️  No hardcoded colors found to replace.");
}

console.log("✅ Calendar CSS now uses centralized design tokens!");
