#!/usr/bin/env node

/**
 * Dead Code Cleanup Script
 *
 * Safely removes identified dead code and unused files
 * Run this after reviewing the CODE_AUDIT_REPORT.md
 */

import { promises as fs } from "fs";
import { resolve } from "path";

const DEAD_FILES = [
  // Unused Pages
  "src/pages/Templates.tsx",
  "src/pages/CalendarPageNew.tsx",
  "src/pages/CalendarPageShell.tsx",
  "src/pages/Logout.tsx",

  // Duplicate Stores
  "src/app/dev-mode-store-new.ts",

  // Unused Hooks
  "src/hooks/useAdvancedRSVP.ts",
  "src/hooks/useCalendar.ts",
  "src/hooks/useComplexityTracking.ts",
  "src/hooks/useDashboard.ts",
  "src/hooks/useDataResolution.ts",
  "src/hooks/useDevTools.ts",
  "src/hooks/useIntelligentCalendar.ts",
  "src/hooks/useMobileErrorHandler.ts",
  "src/hooks/useNetworkStatus.ts",
  "src/hooks/useOfflineData.ts",
  "src/hooks/useOptimizedPracticeData.ts",
  "src/hooks/usePlaySearch.ts",
  "src/hooks/usePlaybook.ts",
  "src/hooks/useVirtualScrollInfinite.ts",

  // Unused Libs
  "src/lib/database-explorer.ts",
  "src/lib/schema-discovery.ts",
  "src/lib/supabaseClient.ts",

  // Demo utilities
  "src/utils/demo-data-check.ts",

  // Unused configs
  "src/config/productionConfig.ts",
];

const FILES_TO_CLEAN = [
  {
    file: "src/routes/paths.ts",
    description: "Remove TEMPLATES route constant",
    find: /\s*TEMPLATES:\s*"\/templates",?\s*/g,
    replace: "",
  },
  {
    file: "src/routes/importers.ts",
    description: "Remove Templates import case",
    find: /\s*case ROUTES\.TEMPLATES:\s*return \(\) => import\("\.\.\/pages\/Templates"\);\s*/g,
    replace: "",
  },
  {
    file: "src/routes/DataRouter.tsx",
    description: "Remove LazyTemplatesPage import and usage",
    find: /,?\s*LazyTemplatesPage,?\s*/g,
    replace: "",
  },
];

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function deleteDeadFiles() {
  console.log("🗑️  Removing dead files...\n");

  let deletedCount = 0;
  let skippedCount = 0;

  for (const file of DEAD_FILES) {
    const fullPath = resolve(process.cwd(), file);

    if (await fileExists(fullPath)) {
      try {
        await fs.unlink(fullPath);
        console.log(`✅ Deleted: ${file}`);
        deletedCount++;
      } catch (error) {
        console.log(`❌ Failed to delete: ${file} - ${error.message}`);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
      skippedCount++;
    }
  }

  console.log(
    `\n📊 Summary: ${deletedCount} deleted, ${skippedCount} skipped\n`
  );
}

async function cleanFileContents() {
  console.log("🧹 Cleaning file contents...\n");

  for (const { file, description, find, replace } of FILES_TO_CLEAN) {
    const fullPath = resolve(process.cwd(), file);

    if (await fileExists(fullPath)) {
      try {
        const content = await fs.readFile(fullPath, "utf8");
        const newContent = content.replace(find, replace);

        if (content !== newContent) {
          await fs.writeFile(fullPath, newContent, "utf8");
          console.log(`✅ Cleaned: ${file} - ${description}`);
        } else {
          console.log(`ℹ️  No changes needed: ${file}`);
        }
      } catch (error) {
        console.log(`❌ Failed to clean: ${file} - ${error.message}`);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
}

async function main() {
  console.log("🔍 DEAD CODE CLEANUP STARTING...\n");

  try {
    await deleteDeadFiles();
    await cleanFileContents();

    console.log("✨ Dead code cleanup completed!\n");
    console.log("📋 Next steps:");
    console.log("   1. Run: npm run type-check");
    console.log("   2. Run: npm run lint");
    console.log("   3. Run: npm run test");
    console.log("   4. Review changes and commit");
  } catch (error) {
    console.error("💥 Cleanup failed:", error);
    process.exit(1);
  }
}

main();
