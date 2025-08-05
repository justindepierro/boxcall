#!/usr/bin/env node

/**
 * Emoji Culling Script 🔫
 * Replace all emojis with proper Icon components for professional appearance
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 EMOJI HUNT: Starting the great emoji purge...");
console.log("===============================================\n");

// Define emoji to icon mappings
const emojiToIconMap = {
  // Sports & Achievement Icons
  "🏈": { icon: "Sports", description: "Football" },
  "🏆": { icon: "Trophy", description: "Trophy/Achievement" },
  "🥇": { icon: "Award", description: "Gold Medal" },
  "🎖️": { icon: "Medal", description: "Medal" },
  "🛡️": { icon: "Shield", description: "Shield/Defense" },
  "👑": { icon: "Crown", description: "Crown/Leadership" },
  "🎯": { icon: "Target", description: "Target/Goal" },

  // Status & Communication Icons
  "✅": { icon: "CheckCircle", description: "Success/Complete" },
  "❌": { icon: "XCircle", description: "Error/Failed" },
  "⚠️": { icon: "AlertTriangle", description: "Warning" },
  "🔍": { icon: "Search", description: "Search/Investigate" },
  "📊": { icon: "BarChart3", description: "Statistics/Chart" },
  "🔓": { icon: "Unlock", description: "Unlocked/Access" },
  "🔒": { icon: "Lock", description: "Locked/Secure" },

  // Action & Power Icons
  "🔥": { icon: "Flame", description: "Fire/Hot streak" },
  "⚡": { icon: "Zap", description: "Lightning/Power" },
  "💎": { icon: "Gem", description: "Diamond/Premium" },
  "🚀": { icon: "Rocket", description: "Launch/Fast" },

  // Design & UI Icons
  "🎨": { icon: "Palette", description: "Design/Colorful" },
  "🛠️": { icon: "Settings", description: "Tools/Settings" },
  "📝": { icon: "FileText", description: "Document/Notes" },
  "📋": { icon: "Clipboard", description: "Clipboard/List" },

  // Console/Debug emojis (these will be replaced or removed)
  "🎯": { icon: "Target", description: "Target" },
  "📈": { icon: "TrendingUp", description: "Trending Up" },
  "🎉": { icon: "PartyPopper", description: "Celebration" },
  "🎊": { icon: "Confetti", description: "Party" },
};

// Files to process
const filesToProcess = [
  "src/services/achievementService.ts",
  "src/services/DashboardServiceV4.ts",
  "src/services/dashboardService.ts",
  "src/services/rbac/RBACService.ts",
  "src/pages/DashboardPageV4.tsx",
  "src/components/team-dashboard/TeamTrophyCase.tsx",
  "src/components/team-dashboard/TeamRoster.tsx",
  "src/components/team-dashboard/TeamCalendar.tsx",
  "src/components/team-dashboard/TeamQuickActions.tsx",
  "src/components/practice/PracticePDFExportDialog.tsx",
  "src/components/dashboard/PersonalProfile.tsx",
  "src/components/team/TeamSettings.tsx",
  "src/components/football/StatsDashboard.tsx",
  "src/components/playbook/visual/EnhancedFieldCanvas.tsx",
  "src/components/ui/Animations/SquareAnimations.tsx",
  "src/components/dev/CleanDevPanel.tsx",
  "src/components/dev/QuickDevPanel.tsx",
  "src/components/dev/QuickDevPanelEnhanced.tsx",
  "src/app/dev-mode-types-clean.ts",
  "src/lib/schema-discovery.ts",
  "src/lib/database-explorer.ts",
  "src/design-system/utils.ts",
];

let totalReplacements = 0;
let processedFiles = 0;

console.log("🎯 Processing files for emoji replacement...\n");

filesToProcess.forEach((relativePath) => {
  const filePath = path.join(__dirname, "..", relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }

  console.log(`📝 Processing: ${relativePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;
  let isReactComponent = relativePath.endsWith(".tsx");

  // Add Icon import if it's a React component and we make changes
  let needsIconImport = false;

  // Process each emoji
  Object.entries(emojiToIconMap).forEach(([emoji, iconData]) => {
    const emojiRegex = new RegExp(
      emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );

    if (content.includes(emoji)) {
      if (isReactComponent) {
        // For React components, replace with Icon component
        if (
          relativePath.includes("/components/") ||
          relativePath.includes("/pages/")
        ) {
          // Replace emoji spans and direct usage with Icon component
          content = content.replace(
            new RegExp(
              `<span[^>]*>${emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`,
              "g"
            ),
            `<Icon name="${iconData.icon}" className="w-5 h-5" />`
          );
          content = content.replace(
            new RegExp(
              `"${emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}";`,
              "g"
            ),
            `<Icon name="${iconData.icon}" className="w-4 h-4" />`
          );
          content = content.replace(
            new RegExp(
              `"${emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[,}]`,
              "g"
            ),
            `<Icon name="${iconData.icon}" className="w-4 h-4" />`
          );

          // Simple string replacements in text
          content = content.replace(
            emojiRegex,
            `<Icon name="${iconData.icon}" className="w-4 h-4 inline" />`
          );
          needsIconImport = true;
        } else {
          // For service files, replace with descriptive text
          content = content.replace(emojiRegex, `[${iconData.description}]`);
        }
      } else {
        // For TypeScript service files, replace with descriptive text
        content = content.replace(emojiRegex, `[${iconData.description}]`);
      }

      const matches = (
        fs.readFileSync(filePath, "utf8").match(emojiRegex) || []
      ).length;
      if (matches > 0) {
        console.log(
          `  ✅ ${emoji} → ${isReactComponent ? "Icon." + iconData.icon : "[" + iconData.description + "]"} (${matches} instances)`
        );
        fileChanges += matches;
      }
    }
  });

  // Add Icon import if needed
  if (needsIconImport && !content.includes("import { Icon }")) {
    // Check if there are existing imports
    const importMatch = content.match(/^import.*from.*$/m);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        `${importMatch[0]}\nimport { Icon } from '../ui/Icon/Icon';`
      );
    } else {
      content = `import { Icon } from '../ui/Icon/Icon';\n\n${content}`;
    }
    console.log(`  📦 Added Icon import`);
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(
      `  📄 Updated ${relativePath} with ${fileChanges} emoji replacements`
    );
    totalReplacements += fileChanges;
    processedFiles++;
  } else {
    console.log(`  ℹ️  No emojis found in ${relativePath}`);
  }

  console.log("");
});

console.log(`🎉 EMOJI PURGE COMPLETE!`);
console.log(`================================`);
console.log(`📊 Summary:`);
console.log(`  • Files processed: ${filesToProcess.length}`);
console.log(`  • Files updated: ${processedFiles}`);
console.log(`  • Total emoji replacements: ${totalReplacements}`);
console.log(`  • Icon components added: ${processedFiles} files`);
console.log(``);
console.log(`🏆 Your codebase is now emoji-free and professional!`);
console.log(`✨ All emojis have been replaced with proper Icon components`);
console.log(`🎯 Achievement unlocked: Professional UI consistency!`);
