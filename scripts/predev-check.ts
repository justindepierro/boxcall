#!/usr/bin/env node

/**
 * Pre-development error checking script
 * Runs comprehensive checks before starting the dev server
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  fix?: string;
}

class PreDevChecker {
  private results: CheckResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async runAllChecks(): Promise<boolean> {
    console.log("🔍 Running pre-development checks...\n");

    await this.checkNodeVersion();
    await this.checkPackageJson();
    await this.checkDependencies();
    await this.checkTypeScript();
    await this.checkTailwindConfig();
    await this.checkEslintConfig();
    await this.checkGitSetup();
    await this.checkEnvironmentFiles();

    this.printResults();
    return this.results.every((result) => result.passed);
  }

  private async checkNodeVersion() {
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

      if (majorVersion >= 18) {
        this.addResult(
          "Node.js Version",
          true,
          `✅ Node.js ${nodeVersion} (>= 18.0.0)`
        );
      } else {
        this.addResult(
          "Node.js Version",
          false,
          `❌ Node.js ${nodeVersion} (< 18.0.0)`,
          "Update Node.js to version 18 or higher"
        );
      }
    } catch {
      this.addResult(
        "Node.js Version",
        false,
        "❌ Could not check Node.js version"
      );
    }
  }

  private async checkPackageJson() {
    const packageJsonPath = join(this.projectRoot, "package.json");

    if (!existsSync(packageJsonPath)) {
      this.addResult(
        "package.json",
        false,
        "❌ package.json not found",
        "Run npm init to create package.json"
      );
      return;
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

      const requiredFields = ["name", "version", "scripts", "dependencies"];
      const missingFields = requiredFields.filter(
        (field) => !packageJson[field]
      );

      if (missingFields.length === 0) {
        this.addResult("package.json", true, "✅ package.json is valid");
      } else {
        this.addResult(
          "package.json",
          false,
          `❌ Missing fields: ${missingFields.join(", ")}`,
          "Add missing fields to package.json"
        );
      }
    } catch {
      this.addResult(
        "package.json",
        false,
        "❌ package.json is invalid JSON",
        "Fix JSON syntax in package.json"
      );
    }
  }

  private async checkDependencies() {
    try {
      const nodeModulesPath = join(this.projectRoot, "node_modules");

      if (!existsSync(nodeModulesPath)) {
        this.addResult(
          "Dependencies",
          false,
          "❌ node_modules not found",
          "Run npm install"
        );
        return;
      }

      // Check for common dependency issues
      execSync("npm ls --depth=0", { stdio: "pipe" });
      this.addResult("Dependencies", true, "✅ All dependencies installed");
    } catch {
      this.addResult(
        "Dependencies",
        false,
        "❌ Dependency issues found",
        "Run npm install or npm audit fix"
      );
    }
  }

  private async checkTypeScript() {
    const tsconfigPath = join(this.projectRoot, "tsconfig.json");

    if (!existsSync(tsconfigPath)) {
      this.addResult(
        "TypeScript Config",
        false,
        "❌ tsconfig.json not found",
        "Create tsconfig.json for TypeScript configuration"
      );
      return;
    }

    try {
      execSync("npx tsc --noEmit", { stdio: "pipe" });
      this.addResult("TypeScript", true, "✅ No TypeScript errors");
    } catch {
      this.addResult(
        "TypeScript",
        false,
        "❌ TypeScript compilation errors",
        "Run npx tsc --noEmit for details"
      );
    }
  }

  private async checkTailwindConfig() {
    const tailwindConfigPath = join(this.projectRoot, "tailwind.config.js");
    const postCSSConfigPath = join(this.projectRoot, "postcss.config.js");

    const hasTailwindConfig = existsSync(tailwindConfigPath);
    const hasPostCSSConfig = existsSync(postCSSConfigPath);

    if (hasTailwindConfig && hasPostCSSConfig) {
      this.addResult("Tailwind CSS", true, "✅ Tailwind CSS configured");
    } else {
      const missing: string[] = [];
      if (!hasTailwindConfig) missing.push("tailwind.config.js");
      if (!hasPostCSSConfig) missing.push("postcss.config.js");

      this.addResult(
        "Tailwind CSS",
        false,
        `❌ Missing: ${missing.join(", ")}`,
        "Create missing Tailwind configuration files"
      );
    }
  }

  private async checkEslintConfig() {
    const eslintConfigPath = join(this.projectRoot, ".eslintrc.js");
    const eslintConfigCjsPath = join(this.projectRoot, ".eslintrc.cjs");
    const eslintConfigJsonPath = join(this.projectRoot, ".eslintrc.json");

    const hasEslintConfig =
      existsSync(eslintConfigPath) ||
      existsSync(eslintConfigCjsPath) ||
      existsSync(eslintConfigJsonPath);

    if (hasEslintConfig) {
      try {
        execSync("npx eslint . --ext ts,tsx --max-warnings 0", {
          stdio: "pipe",
        });
        this.addResult("ESLint", true, "✅ No ESLint errors");
      } catch {
        this.addResult(
          "ESLint",
          false,
          "❌ ESLint errors found",
          "Run npm run lint:fix to auto-fix issues"
        );
      }
    } else {
      this.addResult(
        "ESLint Config",
        false,
        "❌ ESLint configuration not found",
        "Create ESLint configuration file"
      );
    }
  }

  private async checkGitSetup() {
    try {
      execSync("git status", { stdio: "pipe" });
      this.addResult("Git Repository", true, "✅ Git repository initialized");
    } catch {
      this.addResult(
        "Git Repository",
        false,
        "❌ Not a git repository",
        "Run git init to initialize repository"
      );
    }
  }

  private async checkEnvironmentFiles() {
    const envExamplePath = join(this.projectRoot, ".env.example");
    const envPath = join(this.projectRoot, ".env");

    if (existsSync(envExamplePath) && !existsSync(envPath)) {
      this.addResult(
        "Environment Files",
        false,
        "❌ .env file missing",
        "Copy .env.example to .env and configure"
      );
    } else {
      this.addResult(
        "Environment Files",
        true,
        "✅ Environment configuration OK"
      );
    }
  }

  private addResult(
    name: string,
    passed: boolean,
    message: string,
    fix?: string
  ) {
    this.results.push({ name, passed, message, fix });
  }

  private printResults() {
    console.log("\n📋 Pre-development Check Results:\n");

    this.results.forEach((result) => {
      console.log(`${result.message}`);
      if (!result.passed && result.fix) {
        console.log(`   💡 Fix: ${result.fix}`);
      }
    });

    const passedCount = this.results.filter((r) => r.passed).length;
    const totalCount = this.results.length;

    console.log(`\n📊 Summary: ${passedCount}/${totalCount} checks passed`);

    if (passedCount === totalCount) {
      console.log("🎉 All checks passed! Ready to start development.");
    } else {
      console.log(
        "⚠️  Some checks failed. Please fix the issues above before starting development."
      );
    }
  }
}

// Run checks if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PreDevChecker();
  checker.runAllChecks().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { PreDevChecker };
