#!/usr/bin/env node
/**
 * Emoji Detection Script
 * Finds all emojis in the codebase and suggests icon mappings
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common emoji to icon mappings for suggestions
const emojiToIconSuggestions = {
  "📝": "file",
  "👨‍💼": "user-check",
  "🏃‍♂️": "users",
  "📊": "bar-chart",
  "⏱️": "clock",
  "📋": "file",
  "🎯": "target",
  "📄": "pdf",
  "✕": "close",
  "❌": "close",
  "✏️": "edit",
  "🗑️": "delete",
  "🏈": "trending-up", // or 'activity'
  "🛡️": "shield",
  "⚡": "zap",
  "🏋️": "activity",
  "🔄": "arrow-right",
  "☕": "pause",
  "⚠️": "warning",
  "🔧": "wrench",
  "✨": "star",
  "💪": "trending-up",
  "🎪": "star",
  "🎭": "eye",
  "🎨": "edit",
  "🏀": "activity",
  "⚽": "activity",
  "🎾": "activity",
  "⭐": "star",
  "🔥": "trending-up",
};

// Emoji regex to match most emojis
const emojiRegex =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu;

function findEmojisInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const matches = content.match(emojiRegex);

    if (matches) {
      const lines = content.split("\n");
      const results = [];

      matches.forEach((emoji) => {
        lines.forEach((line, index) => {
          if (line.includes(emoji)) {
            results.push({
              emoji,
              line: index + 1,
              content: line.trim(),
              suggestion: emojiToIconSuggestions[emoji] || "NEEDS_MAPPING",
            });
          }
        });
      });

      return results;
    }
  } catch (error) {
    console.warn(`Could not read file ${filePath}:`, error.message);
  }

  return [];
}

function scanDirectory(dirPath, extensions = [".tsx", ".ts", ".jsx", ".js"]) {
  const results = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (
        stat.isDirectory() &&
        !file.startsWith(".") &&
        file !== "node_modules"
      ) {
        walk(filePath);
      } else if (
        stat.isFile() &&
        extensions.some((ext) => file.endsWith(ext))
      ) {
        const emojis = findEmojisInFile(filePath);
        if (emojis.length > 0) {
          results.push({
            file: filePath,
            emojis,
          });
        }
      }
    });
  }

  walk(dirPath);
  return results;
}

// Main execution
const srcPath = path.join(path.dirname(__dirname), "src");
const results = scanDirectory(srcPath);

console.log("🔍 BoxCall Emoji Detection Report\n");
console.log("=".repeat(60));

if (results.length === 0) {
  console.log("✅ No emojis found! All icons converted.");
} else {
  let totalEmojis = 0;

  results.forEach(({ file, emojis }) => {
    console.log(`\n📁 ${file.replace(path.dirname(__dirname), ".")}`);
    console.log("-".repeat(40));

    emojis.forEach(({ emoji, line, content, suggestion }) => {
      totalEmojis++;
      console.log(`  ${emoji} Line ${line}: ${content}`);
      console.log(`     → Suggested icon: "${suggestion}"`);
    });
  });

  console.log(
    `\n📊 Summary: ${totalEmojis} emojis found in ${results.length} files`
  );

  // Generate replacement suggestions
  console.log("\n🎯 Quick Replace Suggestions:");
  console.log("=".repeat(60));

  const uniqueEmojis = [
    ...new Set(results.flatMap((r) => r.emojis.map((e) => e.emoji))),
  ];
  uniqueEmojis.forEach((emoji) => {
    const suggestion = emojiToIconSuggestions[emoji] || "NEEDS_MAPPING";
    console.log(`${emoji} → <Icon name="${suggestion}" size="sm" />`);
  });
}
