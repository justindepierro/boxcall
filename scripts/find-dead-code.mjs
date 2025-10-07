#!/usr/bin/env node

/**
 * Dead Code Detection Script
 * Finds orphaned CSS files, unused components, and unreferenced code
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, relative, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const { red, green, yellow, cyan, bold, reset } = colors;

// Statistics
const stats = {
  totalCssFiles: 0,
  orphanedCssFiles: [],
  totalComponents: 0,
  orphanedComponents: [],
  totalPages: 0,
  orphanedPages: [],
};

/**
 * Recursively get all files matching pattern
 */
async function getFiles(dir, pattern, results = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules, dist, build directories
      if (entry.isDirectory()) {
        if (
          ![
            "node_modules",
            "dist",
            "build",
            ".git",
            "coverage",
            "storybook-static",
          ].includes(entry.name)
        ) {
          await getFiles(fullPath, pattern, results);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    // Skip permission errors
  }

  return results;
}

/**
 * Check if a file is referenced anywhere in the codebase
 */
async function isFileReferenced(targetFile, searchDir) {
  const filename = basename(targetFile);
  const filenameWithoutExt = filename.replace(/\.[^.]+$/, "");

  // Get all source files
  const sourceFiles = await getFiles(searchDir, /\.(tsx?|jsx?|css)$/);

  let referenceCount = 0;

  for (const sourceFile of sourceFiles) {
    // Don't check the file against itself
    if (sourceFile === targetFile) continue;

    try {
      const content = await readFile(sourceFile, "utf-8");

      // Check for various import patterns
      const patterns = [
        `import.*['"].*${filenameWithoutExt}['"]`, // ES6 import with filename
        `import.*['"].*${filename}['"]`, // ES6 import with full name
        `@import.*${filename}`, // CSS @import
        `from.*['"].*${filenameWithoutExt}['"]`, // from import
      ];

      for (const pattern of patterns) {
        if (new RegExp(pattern).test(content)) {
          referenceCount++;
          break; // Count once per file
        }
      }
    } catch (err) {
      // Skip files we can't read
    }
  }

  return referenceCount;
}

/**
 * Check CSS files
 */
async function checkCssFiles() {
  console.log(`\n${cyan}${bold}📊 CSS FILES ANALYSIS${reset}`);
  console.log("─".repeat(50));

  const srcDir = join(ROOT_DIR, "src");
  const cssFiles = await getFiles(srcDir, /\.css$/);
  stats.totalCssFiles = cssFiles.length;

  console.log(`Found ${cyan}${cssFiles.length}${reset} CSS files\n`);

  for (const cssFile of cssFiles) {
    const relativePath = relative(ROOT_DIR, cssFile);
    const refCount = await isFileReferenced(cssFile, srcDir);

    if (refCount === 0) {
      console.log(`${red}❌ ORPHANED:${reset} ${relativePath}`);
      stats.orphanedCssFiles.push(relativePath);
    }
  }

  if (stats.orphanedCssFiles.length === 0) {
    console.log(`${green}✅ No orphaned CSS files found!${reset}`);
  }
}

/**
 * Check component files
 */
async function checkComponents() {
  console.log(`\n${cyan}${bold}📦 COMPONENT FILES ANALYSIS${reset}`);
  console.log("─".repeat(50));

  const componentsDir = join(ROOT_DIR, "src", "components");
  const componentFiles = await getFiles(componentsDir, /\.(tsx|jsx)$/);
  stats.totalComponents = componentFiles.length;

  console.log(
    `Found ${cyan}${componentFiles.length}${reset} component files\n`
  );

  // Sample check (checking all would take too long)
  console.log(
    `${yellow}Checking sample of components for references...${reset}\n`
  );

  const sampleSize = Math.min(20, componentFiles.length);
  const sampledComponents = componentFiles.slice(0, sampleSize);

  for (const componentFile of sampledComponents) {
    const relativePath = relative(ROOT_DIR, componentFile);
    const refCount = await isFileReferenced(
      componentFile,
      join(ROOT_DIR, "src")
    );

    if (refCount === 0) {
      console.log(`${red}❌ POTENTIALLY ORPHANED:${reset} ${relativePath}`);
      stats.orphanedComponents.push(relativePath);
    }
  }

  console.log(
    `\n${yellow}Note: Only checked ${sampleSize}/${componentFiles.length} components (sampling)${reset}`
  );
}

/**
 * Check page files
 */
async function checkPages() {
  console.log(`\n${cyan}${bold}📄 PAGE FILES ANALYSIS${reset}`);
  console.log("─".repeat(50));

  const pagesDir = join(ROOT_DIR, "src", "pages");
  const pageFiles = await getFiles(pagesDir, /\.(tsx|jsx)$/);
  stats.totalPages = pageFiles.length;

  console.log(`Found ${cyan}${pageFiles.length}${reset} page files\n`);

  for (const pageFile of pageFiles) {
    const relativePath = relative(ROOT_DIR, pageFile);
    const refCount = await isFileReferenced(pageFile, join(ROOT_DIR, "src"));

    if (refCount === 0) {
      console.log(`${red}❌ POTENTIALLY ORPHANED:${reset} ${relativePath}`);
      stats.orphanedPages.push(relativePath);
    }
  }

  if (stats.orphanedPages.length === 0) {
    console.log(`${green}✅ All page files appear to be referenced!${reset}`);
  }
}

/**
 * Print summary report
 */
function printSummary() {
  console.log(`\n${cyan}${bold}📋 SUMMARY REPORT${reset}`);
  console.log("═".repeat(50));

  console.log(`\n${bold}CSS Files:${reset}`);
  console.log(`  Total: ${stats.totalCssFiles}`);
  console.log(`  Orphaned: ${red}${stats.orphanedCssFiles.length}${reset}`);

  console.log(`\n${bold}Components:${reset}`);
  console.log(`  Total: ${stats.totalComponents}`);
  console.log(
    `  Potentially Orphaned: ${red}${stats.orphanedComponents.length}${reset}`
  );

  console.log(`\n${bold}Pages:${reset}`);
  console.log(`  Total: ${stats.totalPages}`);
  console.log(
    `  Potentially Orphaned: ${red}${stats.orphanedPages.length}${reset}`
  );

  const totalOrphaned =
    stats.orphanedCssFiles.length +
    stats.orphanedComponents.length +
    stats.orphanedPages.length;

  console.log(
    `\n${bold}Total Potentially Dead Code:${reset} ${red}${totalOrphaned} files${reset}`
  );

  if (totalOrphaned > 0) {
    console.log(
      `\n${yellow}⚠️  Recommendation: Review these files and consider deletion if confirmed unused${reset}`
    );
  } else {
    console.log(`\n${green}✅ Great! No obvious dead code detected${reset}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`${bold}${cyan}`);
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║     🔍 DEAD CODE DETECTION ANALYSIS 🔍        ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log(reset);

  try {
    await checkCssFiles();
    await checkComponents();
    await checkPages();
    printSummary();

    console.log(`\n${green}✅ Analysis complete!${reset}\n`);
  } catch (err) {
    console.error(`${red}Error during analysis:${reset}`, err);
    process.exit(1);
  }
}

main();
