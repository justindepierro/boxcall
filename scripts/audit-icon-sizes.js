#!/usr/bin/env node

/**
 * Icon Size Audit Script
 *
 * Scans for Icon components and suggests size improvements
 * for better coach accessibility
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const srcDir = "src";
const excludeDirs = ["node_modules", ".git", "dist", "build"];

function findTSXFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    if (excludeDirs.includes(item)) continue;

    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findTSXFiles(fullPath, files);
    } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function auditIconSizes() {
  const files = findTSXFiles(srcDir);
  const iconUsage = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // Look for Icon components
        const iconMatch = line.match(/<Icon\s+name="([^"]+)"\s+size="([^"]+)"/);
        if (iconMatch) {
          const [, iconName, size] = iconMatch;
          iconUsage.push({
            file,
            line: index + 1,
            iconName,
            size,
            context: line.trim(),
            suggestion: getSizeSuggestion(iconName, size, line),
          });
        }

        // Look for size="xs" which might be too small
        if (line.includes('size="xs"') && line.includes("<Icon")) {
          iconUsage.push({
            file,
            line: index + 1,
            iconName: "unknown",
            size: "xs",
            context: line.trim(),
            suggestion: '🔍 Consider "sm" or "md" for better visibility',
          });
        }
      });
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }

  return iconUsage;
}

function getSizeSuggestion(iconName, currentSize, context) {
  // Action buttons should be easily clickable
  if (context.includes("button") || context.includes("onClick")) {
    if (currentSize === "xs")
      return '🎯 Use "sm" or "md" for button accessibility';
    if (currentSize === "sm") return "✅ Good size for buttons";
    return "✅ Good size for clickable elements";
  }

  // Headers should be prominent
  if (
    context.includes("headline") ||
    context.includes("header") ||
    context.includes("title")
  ) {
    if (currentSize === "xs" || currentSize === "sm")
      return '📈 Consider "lg" or "xl" for headers';
    return "✅ Good size for headers";
  }

  // Close buttons should be easy to hit
  if (iconName === "close" || iconName === "x") {
    if (currentSize === "xs" || currentSize === "sm")
      return '🎯 Use "lg" or "touch" for close buttons';
    return "✅ Good size for close buttons";
  }

  // PDF/Export buttons should be prominent
  if (iconName === "pdf" || iconName === "download" || iconName === "print") {
    if (currentSize === "xs" || currentSize === "sm")
      return '📄 Use "lg" for important actions';
    return "✅ Good size for important actions";
  }

  return "📏 Current size seems appropriate";
}

function main() {
  console.log("🔍 Auditing Icon Sizes for Coach Accessibility...\n");

  const usage = auditIconSizes();

  if (usage.length === 0) {
    console.log("✅ No Icon components found or all good!");
    return;
  }

  console.log(`Found ${usage.length} Icon components:\n`);

  // Group by size for better overview
  const sizeGroups = usage.reduce((acc, item) => {
    if (!acc[item.size]) acc[item.size] = [];
    acc[item.size].push(item);
    return acc;
  }, {});

  // Show size distribution
  console.log("📊 Size Distribution:");
  Object.entries(sizeGroups).forEach(([size, items]) => {
    console.log(`  ${size}: ${items.length} icons`);
  });
  console.log("");

  // Show suggestions for improvement
  const needsImprovement = usage.filter(
    (item) =>
      item.suggestion.includes("Consider") ||
      item.suggestion.includes("Use") ||
      item.size === "xs"
  );

  if (needsImprovement.length > 0) {
    console.log("🎯 Accessibility Improvement Suggestions:\n");
    needsImprovement.forEach((item) => {
      console.log(`📍 ${item.file}:${item.line}`);
      console.log(`   Icon: ${item.iconName} (size: ${item.size})`);
      console.log(`   ${item.suggestion}`);
      console.log(`   Code: ${item.context}`);
      console.log("");
    });
  } else {
    console.log("✅ All icon sizes look good for accessibility!");
  }

  console.log("\n📚 Size Guide:");
  console.log("  xs (12px)  - Very tight UI, avoid for coaches");
  console.log("  sm (16px)  - Small buttons, inline icons");
  console.log("  md (20px)  - Standard icons, good balance");
  console.log("  lg (24px)  - Larger buttons, headers");
  console.log("  xl (32px)  - Prominent actions, main headers");
  console.log("  2xl (40px) - Coach-friendly size");
  console.log("  3xl (48px) - Extra large for accessibility");
  console.log("  touch (44px) - Minimum touch target size");
}

main();
