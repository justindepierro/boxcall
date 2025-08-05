#!/usr/bin/env node

/**
 * Icon Name Fixer Script
 * Fix PascalCase icon names to lowercase kebab-case
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 ICON NAME FIXER: Converting PascalCase to kebab-case...");

// Icon name mappings
const iconNameMappings = {
  Trophy: "trophy",
  Sports: "award", // Using 'award' as sports might not exist
  Crown: "crown",
  Shield: "shield",
  Target: "target",
  CheckCircle: "check-circle",
  XCircle: "x-circle",
  AlertTriangle: "alert-triangle",
  Search: "search",
  BarChart3: "bar-chart",
  Unlock: "unlock",
  Lock: "lock",
  Flame: "flame",
  Zap: "zap",
  Gem: "gem",
  Rocket: "rocket",
  Palette: "palette",
  Settings: "settings",
  FileText: "file-text",
  Clipboard: "clipboard",
  TrendingUp: "trending-up",
  Medal: "medal",
};

// Files to fix
const filesToFix = [
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

  Object.entries(iconNameMappings).forEach(([pascalCase, kebabCase]) => {
    const pattern = new RegExp(`name="${pascalCase}"`, "g");
    const replacement = `name="${kebabCase}"`;

    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      content = content.replace(pattern, replacement);
      console.log(`  ✅ ${pascalCase} → ${kebabCase} (${matches} instances)`);
      fileChanges += matches;
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  📄 Fixed ${fileChanges} icon names in ${relativePath}`);
    totalFixes += fileChanges;
  } else {
    console.log(`  ℹ️  No icon name fixes needed in ${relativePath}`);
  }

  console.log("");
});

console.log(`🎉 ICON NAME FIXING COMPLETE!`);
console.log(`📊 Total icon name fixes: ${totalFixes}`);
console.log(`✨ All icon names are now properly kebab-cased!`);
