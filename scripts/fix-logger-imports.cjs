#!/usr/bin/env node
/**
 * Fix missing logger imports
 * Adds import { logError } from "../utils/logger" to files that use logError but don't import it
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get files that use logError but don't have logger import
const output = execSync(
  'grep -rln "logError(" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v ".test." | grep -v "logger.ts"',
  { encoding: "utf8" }
);
const files = output.trim().split("\n").filter(Boolean);

let fixed = 0;
let skipped = 0;

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, "utf8");

    // Check if already has logger import
    if (
      content.includes("from") &&
      (content.includes('/logger"') || content.includes("/logger'"))
    ) {
      skipped++;
      return;
    }

    // Calculate relative path from file to src/utils/logger
    const dir = path.dirname(file);
    const loggerPath = path.join(process.cwd(), "src/utils/logger");
    let rel = path.relative(dir, loggerPath).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = "./" + rel;

    // Find last import line
    const lines = content.split("\n");
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImportIdx = i;
    }

    if (lastImportIdx >= 0) {
      lines.splice(lastImportIdx + 1, 0, `import { logError } from "${rel}";`);
      fs.writeFileSync(file, lines.join("\n"));
      console.log("✅", file);
      fixed++;
    } else {
      console.log("⚠️ No imports found in", file);
    }
  } catch (err) {
    console.error("❌", file, err.message);
  }
});

console.log("\n📊 Summary:");
console.log(`   Fixed: ${fixed} files`);
console.log(`   Skipped (already had import): ${skipped} files`);
