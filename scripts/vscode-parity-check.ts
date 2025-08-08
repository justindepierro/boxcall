#!/usr/bin/env tsx

/**
 * 🔍 PROFESSIONAL VALIDATION SUITE
 * Comprehensive error detection that matches VS Code's capabilities
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ValidationResult {
  passed: boolean;
  errors: string[];
  summary: string;
}

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

async function validateTypeScript(): Promise<ValidationResult> {
  console.log(
    `${colors.blue}🔍 Running TypeScript Validation...${colors.reset}`
  );

  try {
    await execAsync("npx tsc --noEmit");
    return {
      passed: true,
      errors: [],
      summary: "TypeScript validation passed",
    };
  } catch (error) {
    const execError = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    return {
      passed: false,
      errors: [
        execError.stdout ||
          execError.stderr ||
          execError.message ||
          "Unknown TypeScript error",
      ],
      summary: "TypeScript compilation failed",
    };
  }
}

async function validateESLint(): Promise<ValidationResult> {
  console.log(`${colors.blue}🔍 Running ESLint Validation...${colors.reset}`);

  try {
    await execAsync("npx eslint . --ext ts,tsx --max-warnings 0");
    return {
      passed: true,
      errors: [],
      summary: "ESLint validation passed",
    };
  } catch (error) {
    const execError = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    return {
      passed: false,
      errors: [
        execError.stdout ||
          execError.stderr ||
          execError.message ||
          "Unknown ESLint error",
      ],
      summary: "ESLint found issues",
    };
  }
}

async function detectDependencyIssues(): Promise<ValidationResult> {
  console.log(`${colors.blue}🔍 Detecting Dependency Issues...${colors.reset}`);

  try {
    // Check a sample of source files with strict checking
    const { stdout: files } = await execAsync(
      'find src -name "*.ts" -o -name "*.tsx" | head -5'
    );
    const fileList = files
      .trim()
      .split("\n")
      .filter((f) => f.trim());

    const dependencyErrors: string[] = [];

    for (const file of fileList) {
      try {
        await execAsync(
          `npx tsc --noEmit --strict --skipLibCheck false "${file}"`
        );
      } catch (error) {
        const execError = error as { stdout?: string };
        if (execError.stdout?.includes("node_modules")) {
          dependencyErrors.push(
            `Dependency issue in ${file}: ${execError.stdout}`
          );
        }
      }
    }

    return {
      passed: dependencyErrors.length === 0,
      errors: dependencyErrors,
      summary:
        dependencyErrors.length === 0
          ? "No dependency issues found"
          : `Found ${dependencyErrors.length} dependency issues`,
    };
  } catch (error) {
    const execError = error as { message?: string };
    return {
      passed: false,
      errors: [execError.message || "Unknown dependency check error"],
      summary: "Dependency check failed",
    };
  }
}

async function main() {
  console.log(
    `${colors.bold}${colors.cyan}🚀 PROFESSIONAL VALIDATION SUITE${colors.reset}\n`
  );

  const validations = [
    { name: "TypeScript", fn: validateTypeScript },
    { name: "ESLint", fn: validateESLint },
    { name: "Dependencies", fn: detectDependencyIssues },
  ];

  let allPassed = true;
  let totalErrors = 0;

  for (const validation of validations) {
    const result = await validation.fn();

    console.log(
      `\n${colors.bold}📊 ${validation.name} Results:${colors.reset}`
    );
    console.log(result.summary);

    if (!result.passed) {
      allPassed = false;
      console.log(`${colors.red}❌ FAILED${colors.reset}`);

      if (result.errors.length > 0) {
        console.log(`${colors.red}Errors:${colors.reset}`);
        result.errors.forEach((error) => console.log(`  • ${error}`));
        totalErrors += result.errors.length;
      }
    } else {
      console.log(`${colors.green}✅ PASSED${colors.reset}`);
    }
  }

  console.log(
    `\n${colors.bold}${colors.cyan}📈 FINAL VALIDATION REPORT${colors.reset}`
  );
  console.log(`Total Errors: ${colors.red}${totalErrors}${colors.reset}`);

  if (allPassed) {
    console.log(
      `${colors.green}${colors.bold}🎉 ALL VALIDATIONS PASSED!${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}${colors.bold}💥 VALIDATION FAILED - BLOCKING DEVELOPMENT${colors.reset}`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    `${colors.red}💥 Validation suite crashed:${colors.reset}`,
    error
  );
  process.exit(1);
});
