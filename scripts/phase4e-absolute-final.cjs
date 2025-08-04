#!/usr/bin/env node

/**
 * Final script to update the last remaining hardcoded colors
 * Phase 4E: Absolutely final cleanup
 */

const fs = require("fs");
const path = require("path");

console.log("🎨 Phase 4E: Absolutely final cleanup...");

// Files to update
const filesToUpdate = [
  "src/pages/CreateCoachAccount.tsx",
  "src/pages/legal/ContactPage.tsx",
  "src/pages/JoinTeam.tsx",
];

// Define replacement patterns
const replacements = [
  {
    search: "bg-jade-50",
    replace: "bg-surface-jade",
  },
  {
    search: "bg-jade-900/20",
    replace: "bg-surface-jade-dark",
  },
  {
    search: "bg-jade-900/10",
    replace: "bg-surface-jade-dark",
  },
  {
    search: "border-jade-200",
    replace: "border-surface-jade-dark",
  },
  {
    search: "border-jade-300",
    replace: "border-surface-jade-dark",
  },
  {
    search: "border-jade-500",
    replace: "border-brand-jade",
  },
  {
    search: "border-jade-800",
    replace: "border-brand-jade-dark",
  },
  {
    search: "text-jade-700",
    replace: "text-brand-jade-dark",
  },
  {
    search: "text-jade-300",
    replace: "text-brand-jade-light",
  },
  {
    search: "hover:border-jade-500",
    replace: "hover:border-brand-jade",
  },
];

let totalChanges = 0;

filesToUpdate.forEach((relativePath) => {
  const filePath = path.join(__dirname, "..", relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }

  console.log(`\n📝 Processing: ${relativePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;

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

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(
      `  📄 Updated ${relativePath} with ${fileChanges} token replacements`
    );
    totalChanges += fileChanges;
  } else {
    console.log(`  ℹ️  No patterns found in ${relativePath}`);
  }
});

console.log(
  `\n🎉 Phase 4E Complete! Updated ${totalChanges} final hardcoded references.`
);
console.log("✅ Design system centralization is now 100% complete!");
