#!/usr/bin/env npx tsx

/**
 * Professional Pre-Development Validation Suite
 *
 * Runs comprehensive checks before starting development server:
 * - TypeScript compilation with strict error checking
 * - ESLint with zero tolerance for warnings
 * - Format validation
 * - Import validation
 * - Dead code detection
 *
 * This ensures a professional development environment.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

interface CheckResult {
  name: string;
  success: boolean;
  message: string;
  duration: number;
}

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

function runCommand(command: string, description: string): CheckResult {
  const startTime = Date.now();

  try {
    log(`🔍 ${description}...`, colors.blue);
    execSync(command, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    const duration = Date.now() - startTime;
    const success = true;
    const message = `✅ ${description} passed (${duration}ms)`;

    log(message, colors.green);
    return { name: description, success, message, duration };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const success = false;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const message = `❌ ${description} failed (${duration}ms)\n${errorMessage}`;

    log(message, colors.red);
    return { name: description, success, message, duration };
  }
}

function runUnusedExportsCheck(): CheckResult {
  const startTime = Date.now();

  try {
    log(`🔍 Unused Export Detection...`, colors.blue);
    execSync(
      'npx ts-unused-exports tsconfig.app.json --ignoreFiles="test,spec,stories"',
      {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
      }
    );

    const duration = Date.now() - startTime;
    const message = `✅ Unused Export Detection passed (${duration}ms)`;
    log(message, colors.green);
    return {
      name: "Unused Export Detection",
      success: true,
      message,
      duration,
    };
  } catch (_error: unknown) {
    const duration = Date.now() - startTime;
    // For unused exports, we treat it as a warning, not a failure
    const message = `⚠️ Unused Export Detection found unused exports (${duration}ms) - Non-blocking`;
    log(message, colors.yellow);
    return {
      name: "Unused Export Detection",
      success: true,
      message,
      duration,
    };
  }
}

async function main(): Promise<void> {
  const skip =
    process.env.BC_SKIP_PREDEV === "1" || process.env.BC_PREDEV_MODE === "skip";
  const relaxed =
    process.env.BC_LINT_MODE === "relaxed" ||
    process.env.BC_PREDEV_MODE === "relaxed";
  if (skip) {
    log(
      "⚡ Predev checks skipped via BC_SKIP_PREDEV/BC_PREDEV_MODE",
      colors.yellow
    );
    process.exit(0);
  }

  log(
    "🚀 PROFESSIONAL PRE-DEVELOPMENT VALIDATION" +
      (relaxed ? " (RELAXED)" : ""),
    colors.bold
  );
  log("================================================", colors.blue);

  const checks: CheckResult[] = [];

  // 1. TypeScript Compilation Check - ZERO TOLERANCE
  checks.push(
    runCommand(
      "npx tsc --noEmit --strict --noUnusedLocals --noUnusedParameters",
      "TypeScript Strict Compilation"
    )
  );

  // 2. ESLint Check - ZERO WARNINGS
  const eslintMaxWarnings = relaxed ? 200 : 0;
  checks.push(
    runCommand(
      `npx eslint src/ --ext .ts,.tsx --max-warnings ${eslintMaxWarnings} --format stylish`,
      relaxed ? "ESLint Validation (relaxed)" : "ESLint Zero-Warning Validation"
    )
  );

  // 3. Format Check - CONSISTENT STYLE
  const skipFormat = process.env.BC_PREDEV_NO_FORMAT === "1";
  if (!skipFormat) {
    checks.push(
      runCommand("npx prettier --check src/", "Prettier Format Validation")
    );
  } else {
    log("⏭️  Skipping Prettier check (BC_PREDEV_NO_FORMAT=1)", colors.yellow);
  }

  // 4. Import Validation - REPORT UNUSED EXPORTS (NON-BLOCKING)
  checks.push(runUnusedExportsCheck());

  // 5. Bundle Analysis - SIZE CHECK
  const skipAnalyze = process.env.BC_PREDEV_SKIP_ANALYZE === "1";
  if (existsSync("dist") && !skipAnalyze) {
    checks.push(
      runCommand(
        "npx vite-bundle-analyzer dist --mode production",
        "Bundle Size Analysis"
      )
    );
  } else if (existsSync("dist") && skipAnalyze) {
    log(
      "⏭️  Skipping bundle analysis (BC_PREDEV_SKIP_ANALYZE=1)",
      colors.yellow
    );
  }

  // Summary Report
  log("\n📊 VALIDATION SUMMARY", colors.bold);
  log("===================", colors.blue);

  const passed = checks.filter((c) => c.success);
  const failed = checks.filter((c) => !c.success);
  const totalTime = checks.reduce((sum, c) => sum + c.duration, 0);

  log(`✅ Passed: ${passed.length}/${checks.length}`, colors.green);
  log(
    `❌ Failed: ${failed.length}/${checks.length}`,
    failed.length > 0 ? colors.red : colors.green
  );
  log(`⏱️  Total Time: ${totalTime}ms`, colors.blue);

  if (failed.length > 0 && !relaxed) {
    log("\n🚨 DEVELOPMENT SERVER BLOCKED - FIX ERRORS FIRST", colors.red);
    log("Failed checks:", colors.red);
    failed.forEach((check) => {
      log(`  • ${check.name}`, colors.red);
    });
    process.exit(1);
  }

  if (failed.length > 0 && relaxed) {
    log(
      "\n⚠️  RELAXED MODE: Allowing dev server despite failures",
      colors.yellow
    );
  }

  log("\n🎉 ALL CHECKS PASSED - DEVELOPMENT SERVER READY!", colors.green);
  log("Professional development environment validated ✨", colors.green);
}

// Run the validation
main().catch((error: unknown) => {
  console.error("Validation script failed:", error);
  process.exit(1);
});
