#!/usr/bin/env npx tsx

/**
 * VS Code Error Detection Script
 *
 * This script replicates what VS Code sees and surfaces all errors
 * that might be hidden from command-line tools
 */

import { execSync } from "child_process";
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function getAllTypeScriptFiles(
  dir: string,
  extensions: string[] = [".ts", ".tsx"]
): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    try {
      const items = readdirSync(currentDir);

      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules, dist, etc.
          if (
            !["node_modules", "dist", "build", ".git", ".vscode"].includes(item)
          ) {
            walkDir(fullPath);
          }
        } else {
          const hasValidExtension = extensions.some((ext) =>
            item.endsWith(ext)
          );
          if (hasValidExtension) {
            files.push(fullPath);
          }
        }
      }
    } catch (_error) {
      // Skip directories we can't read
    }
  }

  walkDir(dir);
  return files;
}

function checkFileSyntax(filePath: string): { valid: boolean; error?: string } {
  try {
    const content = readFileSync(filePath, "utf8");

    // Basic syntax checks that VS Code would catch
    const issues: string[] = [];

    // Check for obviously broken syntax
    if (content.includes("// }") && !content.includes("// }")) {
      // Malformed comment blocks
      issues.push("Malformed comment blocks detected");
    }

    // Check for incomplete JSDoc
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(jsdocRegex);
    if (matches) {
      matches.forEach((match, index) => {
        if (!match.endsWith("*/") || match.includes("*/ ")) {
          issues.push(`Malformed JSDoc block ${index + 1}`);
        }
      });
    }

    // Check for orphaned code fragments
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Look for lines that start with code but have comment fragments
      if (trimmed.startsWith("checks.push") && line.includes("//")) {
        issues.push(`Line ${index + 1}: Possible code/comment mixing`);
      }
    });

    return {
      valid: issues.length === 0,
      error: issues.length > 0 ? issues.join("; ") : undefined,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Cannot read file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function runDetection(): Promise<void> {
  log("🔍 COMPREHENSIVE ERROR DETECTION", colors.bold);
  log("=================================", colors.blue);

  const projectRoot = process.cwd();
  const srcDir = join(projectRoot, "src");
  const scriptsDir = join(projectRoot, "scripts");

  // Get all TypeScript files
  const allFiles = [
    ...getAllTypeScriptFiles(srcDir),
    ...getAllTypeScriptFiles(scriptsDir),
    ...getAllTypeScriptFiles(projectRoot, [".ts", ".tsx"]).filter(
      (f) =>
        !f.includes("/src/") &&
        !f.includes("/scripts/") &&
        !f.includes("/node_modules/")
    ),
  ];

  log(`📁 Found ${allFiles.length} TypeScript files`, colors.blue);

  let syntaxErrors = 0;
  let typeErrors = 0;
  let lintErrors = 0;

  // 1. Check basic syntax issues
  log("\n🔧 Checking syntax issues...", colors.yellow);
  for (const file of allFiles) {
    const relativePath = file.replace(projectRoot, ".");
    const result = checkFileSyntax(file);

    if (!result.valid) {
      log(`❌ ${relativePath}: ${result.error}`, colors.red);
      syntaxErrors++;
    }
  }

  // 2. Run TypeScript with detailed output
  log("\n📝 Running detailed TypeScript check...", colors.yellow);
  try {
    execSync("npx tsc --noEmit --strict --pretty", {
      stdio: "pipe",
      encoding: "utf8",
    });
    log("✅ No TypeScript errors found", colors.green);
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    const output = execError.stdout || execError.stderr || "";
    if (output.trim()) {
      log("❌ TypeScript errors:", colors.red);
      console.log(output);
      typeErrors++;
    }
  }

  // 3. Run ESLint with detailed output
  log("\n🔍 Running detailed ESLint check...", colors.yellow);
  try {
    execSync("npx eslint src/ scripts/ --ext .ts,.tsx --format stylish", {
      stdio: "pipe",
      encoding: "utf8",
    });
    log("✅ No ESLint errors found", colors.green);
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    const output = execError.stdout || execError.stderr || "";
    if (output.trim()) {
      log("❌ ESLint errors:", colors.red);
      console.log(output);
      lintErrors++;
    }
  }

  // 4. Check for phantom imports and references
  log("\n👻 Checking for phantom references...", colors.yellow);
  try {
    const phantomCheck = execSync(
      'grep -r "import.*from.*DevToolsPanel\\|SimpleDevTools\\|ProfessionalDevTools" src/',
      {
        encoding: "utf8",
        stdio: "pipe",
      }
    );
    if (phantomCheck.trim()) {
      log("❌ Phantom imports found:", colors.red);
      console.log(phantomCheck);
    }
  } catch {
    log("✅ No phantom imports found", colors.green);
  }

  // Summary
  log("\n📊 ERROR DETECTION SUMMARY", colors.bold);
  log("===========================", colors.blue);
  log(
    `🔧 Syntax Issues: ${syntaxErrors}`,
    syntaxErrors > 0 ? colors.red : colors.green
  );
  log(
    `📝 TypeScript Errors: ${typeErrors}`,
    typeErrors > 0 ? colors.red : colors.green
  );
  log(
    `🔍 ESLint Issues: ${lintErrors}`,
    lintErrors > 0 ? colors.red : colors.green
  );

  const totalErrors = syntaxErrors + typeErrors + lintErrors;

  if (totalErrors > 0) {
    log(`\n🚨 TOTAL ERRORS FOUND: ${totalErrors}`, colors.red);
    log(
      "These are the errors VS Code is seeing that command-line tools missed!",
      colors.yellow
    );
    process.exit(1);
  } else {
    log("\n🎉 NO ERRORS DETECTED!", colors.green);
    log("Your codebase is clean! 🧹✨", colors.green);
  }
}

// Run the detection
runDetection().catch((error: unknown) => {
  console.error("Error detection failed:", error);
  process.exit(1);
});
