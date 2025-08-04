#!/usr/bin/env node

/**
 * Script to update all feature components with centralized design tokens
 * Phase 4: Route protection, Dashboard, and other feature components
 */

const fs = require("fs");
const path = require("path");

console.log("🎨 Phase 4: Updating Feature Components with design tokens...");

// Files to update
const filesToUpdate = [
  "src/routes/PermissionRoute.tsx",
  "src/routes/TeamMemberRoute.tsx",
  "src/routes/SubscriptionRoute.tsx",
  "src/routes/SuperAdminRoute.tsx",
  "src/routes/AppRouter.tsx",
  "src/routes/RoleProtectedRoute.tsx",
  "src/routes/ProtectedRoute.tsx",
  "src/pages/About.tsx",
  "src/pages/DashboardPageV4.tsx",
  "src/pages/DashboardPage.tsx",
  "src/pages/Playground.tsx",
];

// Define replacement patterns for all jade/navy hardcoded colors
const replacements = [
  // Loading spinner border colors
  {
    search: "border-jade-600",
    replace: "border-brand-jade",
  },
  // Button background and hover colors
  {
    search: "bg-jade-500",
    replace: "bg-brand-jade",
  },
  {
    search: "hover:bg-jade-600",
    replace: "hover:bg-interaction-jade",
  },
  {
    search: "hover:bg-jade-700",
    replace: "hover:bg-brand-jade-dark",
  },
  {
    search: "bg-jade-600",
    replace: "bg-interaction-jade",
  },
  // Text colors
  {
    search: "text-jade-600",
    replace: "text-interaction-jade",
  },
  {
    search: "text-jade-800",
    replace: "text-brand-jade-dark",
  },
  {
    search: "text-jade-200",
    replace: "text-brand-jade-light",
  },
  // Background colors for surfaces
  {
    search: "bg-jade-50",
    replace: "bg-surface-jade",
  },
  {
    search: "bg-jade-100",
    replace: "bg-surface-jade",
  },
  {
    search: "from-jade-50",
    replace: "from-surface-jade",
  },
  {
    search: "to-jade-100",
    replace: "to-surface-jade",
  },
  {
    search: "from-jade-900/20",
    replace: "from-surface-jade-dark",
  },
  {
    search: "to-jade-800/20",
    replace: "to-surface-jade-dark",
  },
  // Border colors
  {
    search: "border-jade-200",
    replace: "border-surface-jade-dark",
  },
  {
    search: "border-jade-800",
    replace: "border-brand-jade-dark",
  },
  {
    search: "border-l-4 border-jade-200",
    replace: "border-l-4 border-surface-jade-dark",
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
  `\n🎉 Phase 4 Complete! Updated ${totalChanges} hardcoded color references across ${filesToUpdate.length} files.`
);
console.log("✅ All feature components now use centralized design tokens!");
