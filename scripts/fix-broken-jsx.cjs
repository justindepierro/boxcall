#!/usr/bin/env node

/**
 * Fix Broken JSX in String Literals
 * Revert JSX components that were incorrectly placed in string literals
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 FIXING BROKEN JSX IN STRINGS...");

const filesToFix = [
  "src/components/dev/CleanDevPanel.tsx",
  "src/components/dev/QuickDevPanel.tsx",
  "src/components/dev/QuickDevPanelEnhanced.tsx",
  "src/components/playbook/visual/EnhancedFieldCanvas.tsx",
  "src/components/team-dashboard/TeamTrophyCase.tsx",
];

// Fix patterns - revert broken JSX in strings back to emojis or text
const fixPatterns = [
  {
    search: '"<Icon name="trophy" className="w-4 h-4 inline" /> Head Coach"',
    replace: '"🏆 Head Coach"',
  },
  {
    search: '"<Icon name="crown" className="w-4 h-4 inline" /> Dev Head Coach"',
    replace: '"👑 Dev Head Coach"',
  },
  {
    search:
      '"<Icon name="clipboard" className="w-4 h-4 inline" /> Team Manager"',
    replace: '"📋 Team Manager"',
  },
  {
    search: '"<Icon name="settings" className="w-4 h-4 inline" /> Settings"',
    replace: '"⚙️ Settings"',
  },
  {
    search: '"<Icon name="award" className="w-4 h-4 inline" /> Football Field"',
    replace: '"🏈 Football Field"',
  },
  {
    search: 'icon: "<Icon name="award" className="w-4 h-4" />"',
    replace: 'icon: "🏈"',
  },
  {
    search:
      'name: "<Icon name="award" className="w-4 h-4 inline" /> Touchdowns"',
    replace: 'name: "🏈 Touchdowns"',
  },
];

let totalFixes = 0;

filesToFix.forEach((relativePath) => {
  const filePath = path.join(__dirname, "..", relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }

  console.log(`📝 Fixing: ${relativePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;

  fixPatterns.forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.replace(
        new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        replace
      );
      console.log(`  ✅ Fixed broken JSX: ${search.substring(0, 30)}...`);
      fileChanges++;
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(
      `  📄 Fixed ${fileChanges} broken JSX patterns in ${relativePath}`
    );
    totalFixes += fileChanges;
  } else {
    console.log(`  ℹ️  No broken JSX found in ${relativePath}`);
  }

  console.log("");
});

console.log(`🎉 BROKEN JSX FIXING COMPLETE!`);
console.log(`📊 Total fixes: ${totalFixes}`);
console.log(`✨ All string literals are now properly formatted!`);
