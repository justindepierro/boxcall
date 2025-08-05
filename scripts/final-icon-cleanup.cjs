#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log(
  "🔧 FINAL ICON CLEANUP: Fixing all remaining malformed Icon components..."
);
console.log(
  "=========================================================================\n"
);

// Files that might still have issues
const filesToFix = [
  "src/components/dev/CleanDevPanel.tsx",
  "src/components/dev/QuickDevPanel.tsx",
  "src/components/dev/QuickDevPanelEnhanced.tsx",
  "src/components/playbook/visual/EnhancedFieldCanvas.tsx",
  "src/components/team-dashboard/TeamTrophyCase.tsx",
];

let totalFixes = 0;

function fixMalformedIcons(content, filename) {
  let fixes = 0;
  let newContent = content;

  // Fix malformed Icon strings in object/array literals
  // Pattern: `"<Icon name="iconname" className="..." /> Text"`
  const malformedIconPattern =
    /"<Icon name="[^"]*" className="[^"]*" \/>\s*([^"]*?)"/g;
  newContent = newContent.replace(malformedIconPattern, (match, text) => {
    fixes++;
    return `"${text.trim()}"`;
  });

  // Fix specific malformed patterns we've seen
  const specificPatterns = [
    // CleanDevPanel patterns
    {
      search: `label: "<Icon name="trophy" className="w-4 h-4 inline" /> Head Coach"`,
      replace: `label: "Head Coach"`,
    },
    {
      search: `label: "<Icon name="clipboard" className="w-4 h-4 inline" /> Team Manager"`,
      replace: `label: "Team Manager"`,
    },
    {
      search: `label: "🌍 Production"`,
      replace: `label: "Production"`,
    },
    {
      search: `label: "🆕 Blank Slate"`,
      replace: `label: "Blank Slate"`,
    },
    {
      search: `label: "🧪 Legacy Mock Data"`,
      replace: `label: "Legacy Mock Data"`,
    },
    {
      search: `label: "🔄 Reset to Production Mode"`,
      replace: `label: "Reset to Production Mode"`,
    },
    {
      search: `🚨 DEV MODE ACTIVE`,
      replace: `⚠ DEV MODE ACTIVE`,
    },
    // QuickDevPanel patterns
    {
      search: `🧪 Super Admin (Mock)`,
      replace: `Super Admin (Mock)`,
    },
    // Remove any emoji patterns in labels
    {
      search: /label: "[🔧🚨🌍🆕🧪🔄👨‍🏫🏃‍♂️👨‍👩‍👧‍👦][^"]*"/g,
      replace: (match) => {
        const text = match.replace(/label: "/, "").replace(/"$/, "");
        const cleanText = text.replace(/^[🔧🚨🌍🆕🧪🔄👨‍🏫🏃‍♂️👨‍👩‍👧‍👦]\s*/, "");
        return `label: "${cleanText}"`;
      },
    },
  ];

  // Apply specific pattern fixes
  specificPatterns.forEach((pattern) => {
    if (typeof pattern.search === "string") {
      if (newContent.includes(pattern.search)) {
        newContent = newContent.replace(
          new RegExp(
            pattern.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g"
          ),
          pattern.replace
        );
        fixes++;
      }
    } else {
      const matches = newContent.match(pattern.search);
      if (matches) {
        newContent = newContent.replace(pattern.search, pattern.replace);
        fixes += matches.length;
      }
    }
  });

  return { content: newContent, fixes };
}

// Process each file
filesToFix.forEach((relativePath) => {
  const filePath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }

  console.log(`📝 Fixing: ${relativePath}`);

  const content = fs.readFileSync(filePath, "utf8");
  const result = fixMalformedIcons(content, relativePath);

  if (result.fixes > 0) {
    fs.writeFileSync(filePath, result.content);
    console.log(`  ✅ Fixed ${result.fixes} malformed Icon issues`);
    totalFixes += result.fixes;
  } else {
    console.log(`  ✨ No malformed Icon issues found`);
  }

  console.log("");
});

console.log("🎉 FINAL ICON CLEANUP COMPLETE!");
console.log(`📊 Total fixes applied: ${totalFixes}`);
console.log("✨ All Icon components should now be properly formatted!\n");
