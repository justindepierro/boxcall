#!/usr/bin/env node
/**
 * Fix broken logger imports that were inserted inside multi-line import blocks
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get files that have both "import type {" and "import { logError }"
const output = execSync(
  'grep -l "import type {" src/**/*.ts src/**/*.tsx 2>/dev/null | xargs grep -l "import { logError }" 2>/dev/null',
  { encoding: "utf8" }
);
const files = output.trim().split("\n").filter(Boolean);

let fixed = 0;

files.forEach((file) => {
  try {
    let content = fs.readFileSync(file, "utf8");

    // Check if there's a broken pattern: "import type {\nimport { logError }"
    const brokenPattern =
      /import type \{\s*\nimport \{ logError \} from [^\n]+\n/g;

    if (brokenPattern.test(content)) {
      console.log("Fixing:", file);

      // Calculate relative path
      const dir = path.dirname(file);
      const loggerPath = path.join(process.cwd(), "src/utils/logger");
      let rel = path.relative(dir, loggerPath).replace(/\\/g, "/");
      if (!rel.startsWith(".")) rel = "./" + rel;

      // Extract the logError import line
      const logErrorImportMatch = content.match(
        /import \{ logError \} from [^\n]+\n/
      );

      if (logErrorImportMatch) {
        // Remove the incorrectly placed logError import from inside the type import
        content = content.replace(
          /import type \{\s*\nimport \{ logError \} from [^\n]+\n/,
          "import type {\n"
        );

        // Find where to insert the logError import (after the last import before the broken one)
        // Look for the first import type block and add logError import before it
        const lines = content.split("\n");
        let insertIdx = -1;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("import type {")) {
            // Find the last regular import before this
            for (let j = i - 1; j >= 0; j--) {
              if (
                lines[j].startsWith("import ") &&
                !lines[j].includes("import type")
              ) {
                // Check if this is end of multi-line import
                if (lines[j].includes(" from ") || lines[j].endsWith(";")) {
                  insertIdx = j + 1;
                  break;
                }
              }
              if (lines[j].includes(" from ")) {
                insertIdx = j + 1;
                break;
              }
            }
            break;
          }
        }

        if (insertIdx > 0) {
          lines.splice(insertIdx, 0, `import { logError } from "${rel}";`);
          fs.writeFileSync(file, lines.join("\n"));
          fixed++;
          console.log("  ✅ Fixed");
        } else {
          console.log("  ⚠️ Could not find insertion point");
        }
      }
    }
  } catch (err) {
    console.error("❌", file, err.message);
  }
});

console.log("\n📊 Fixed", fixed, "files");
