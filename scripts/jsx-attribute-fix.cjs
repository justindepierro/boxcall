#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 JSX ATTRIBUTE FIX: Fixing broken JSX attributes...");
console.log("=========================================================\n");

// Files to fix based on error reports
const filesToFix = [
  "src/components/dev/CleanDevPanel.tsx",
  "src/components/dev/QuickDevPanel.tsx",
  "src/components/dev/QuickDevPanelEnhanced.tsx",
];

let totalFixes = 0;

function fixJSXAttributes(content, filename) {
  let fixes = 0;
  let newContent = content;

  // Fix Icon component attributes (remove comma after name prop)
  const iconCommaPattern = /<Icon name="[^"]+",\s*className="/g;
  newContent = newContent.replace(iconCommaPattern, (match) => {
    fixes++;
    return match.replace(",", "");
  });

  // Fix Button component attributes (remove comma between attributes)
  const buttonCommaPattern = /size="[^"]+",\s*variant="[^"]+",\s*onClick=/g;
  newContent = newContent.replace(buttonCommaPattern, (match) => {
    fixes++;
    return match.replace(/,/g, " ");
  });

  // Fix any remaining comma between JSX attributes pattern
  const jsxAttrCommaPattern = /(\w+="[^"]*"),(\s*\w+="[^"]*")/g;
  newContent = newContent.replace(jsxAttrCommaPattern, (match, p1, p2) => {
    fixes++;
    return p1 + " " + p2;
  });

  // Fix comma before onClick in JSX
  const onClickCommaPattern = /,(\s*onClick=)/g;
  newContent = newContent.replace(onClickCommaPattern, (match, p1) => {
    fixes++;
    return " " + p1;
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
  const result = fixJSXAttributes(content, relativePath);

  if (result.fixes > 0) {
    fs.writeFileSync(filePath, result.content);
    console.log(`  ✅ Fixed ${result.fixes} JSX attribute issues`);
    totalFixes += result.fixes;
  } else {
    console.log(`  ✨ No JSX attribute issues found`);
  }

  console.log("");
});

console.log("🎉 JSX ATTRIBUTE FIX COMPLETE!");
console.log(`📊 Total fixes applied: ${totalFixes}`);
console.log("✨ JSX attributes should now be properly formatted!\n");
