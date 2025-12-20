/**
 * Security Audit Script
 *
 * Performs automated security checks on the codebase and configuration
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

interface SecurityIssue {
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  message: string;
  file?: string;
  line?: number;
  recommendation: string;
}

class SecurityAuditor {
  private issues: SecurityIssue[] = [];
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  private addIssue(issue: SecurityIssue) {
    this.issues.push(issue);
  }

  // Check for hardcoded secrets
  private checkHardcodedSecrets() {
    const sensitivePatterns = [
      {
        pattern:
          /(?:api_key|apikey|api-key)\s*[=:]\s*['"][a-zA-Z0-9_-]{16,}['"]/gi,
        type: "hardcoded-api-key",
        excludePatterns: [/required/i, /validation/i, /error/i],
      },
      {
        pattern: /(?:secret|secret_key)\s*[=:]\s*['"][a-zA-Z0-9_-]{16,}['"]/gi,
        type: "hardcoded-secret",
        excludePatterns: [/required/i, /validation/i, /error/i],
      },
      {
        pattern: /(?:token|access_token)\s*[=:]\s*['"][a-zA-Z0-9_-]{16,}['"]/gi,
        type: "hardcoded-token",
        excludePatterns: [/required/i, /validation/i, /error/i],
      },
      {
        // Intentionally conservative to avoid flagging UI validation messages.
        // We only flag password assignments that look like actual secrets:
        // - no whitespace
        // - reasonably long
        // - contains non-trivial characters
        pattern: /password\s*[=:]\s*['"][^'"\s]{12,}['"]/gi,
        type: "hardcoded-password",
        excludePatterns: [
          /required/i,
          /validation/i,
          /error/i,
          /must\s+be\s+at\s+least/i,
          /please\s+confirm/i,
          /do\s+not\s+match/i,
          /testpassword/i,
          /authDebug/i,
        ],
      },
    ];

    try {
      const output = execSync(
        `find ${this.projectRoot}/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`,
        { encoding: "utf8" }
      );
      const files = output.trim().split("\n").filter(Boolean);

      files.forEach((file) => {
        try {
          const content = readFileSync(file, "utf8");

          sensitivePatterns.forEach(({ pattern, type, excludePatterns }) => {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach((match) => {
                // Extract the assigned value, if possible, for extra heuristics.
                const valueMatch = match.match(/['"]([^'"]+)['"]/);
                const assignedValue = valueMatch?.[1] ?? "";

                // Check if this match should be excluded
                const shouldExclude = excludePatterns.some(
                  (excludePattern) =>
                    excludePattern.test(match) || excludePattern.test(file)
                );

                // Avoid false positives on sentence-like strings.
                // (e.g., password = "Password must be at least 6 characters")
                const looksLikeSentence = /\s/.test(assignedValue);

                // For password matches, require some character diversity.
                const looksLikeRealSecret =
                  assignedValue.length >= 12 &&
                  !looksLikeSentence &&
                  (/[0-9]/.test(assignedValue) || /[^a-zA-Z0-9]/.test(assignedValue));

                if (!shouldExclude && (type !== "hardcoded-password" || looksLikeRealSecret)) {
                  this.addIssue({
                    severity: "high",
                    type,
                    message: `Potential hardcoded secret found: ${match}`,
                    file,
                    recommendation:
                      "Move sensitive values to environment variables",
                  });
                }
              });
            }
          });
        } catch {
          // Skip files that can't be read
        }
      });
    } catch (error) {
      console.warn("Could not scan for hardcoded secrets:", error);
    }
  }

  // Check environment configuration
  private checkEnvironmentConfig() {
    const envFile = join(this.projectRoot, ".env.local");
    const exampleEnvFile = join(this.projectRoot, ".env.example");

    if (!existsSync(exampleEnvFile)) {
      this.addIssue({
        severity: "medium",
        type: "missing-env-example",
        message: "Missing .env.example file",
        recommendation:
          "Create .env.example with all required environment variables",
      });
    }

    if (existsSync(envFile)) {
      try {
        const envContent = readFileSync(envFile, "utf8");

        // Check for development-only secrets in production patterns
        if (
          envContent.includes("localhost") ||
          envContent.includes("127.0.0.1")
        ) {
          this.addIssue({
            severity: "low",
            type: "dev-config-in-env",
            message: "Development configuration found in .env.local",
            file: ".env.local",
            recommendation:
              "Ensure production environment uses production URLs",
          });
        }
      } catch {
        // Skip if can't read env file
      }
    }
  }

  // Check dependency vulnerabilities
  private checkDependencyVulnerabilities() {
    const parseAndRecordAudit = (
      auditJson: string,
      options?: {
        type?: string;
        severityOverride?: SecurityIssue["severity"];
        recommendationOverride?: string;
      }
    ) => {
      const auditResult = JSON.parse(auditJson);

      if (auditResult.metadata?.vulnerabilities) {
        const { vulnerabilities } = auditResult.metadata;

        Object.entries(vulnerabilities).forEach(([severity, count]) => {
          if (typeof count === "number" && count > 0) {
            this.addIssue({
              severity: (options?.severityOverride ?? (severity as any)) as any,
              type: options?.type ?? "dependency-vulnerability",
              message: `Found ${count} ${severity} dependency vulnerabilities`,
              recommendation:
                options?.recommendationOverride ??
                "Run `npm audit fix` to resolve dependencies",
            });
          }
        });
      }
    };

    const runAuditJson = (command: string): string | undefined => {
      try {
        return execSync(command, {
          encoding: "utf8",
          cwd: this.projectRoot,
        });
      } catch (error: any) {
        // npm audit returns non-zero exit codes when vulnerabilities exist.
        const stdout = typeof error?.stdout === "string" ? error.stdout : undefined;
        if (stdout && stdout.trim().startsWith("{")) return stdout;
        return undefined;
      }
    };

    // Gate on production dependencies.
    const prodAuditJson = runAuditJson("npm audit --omit=dev --json");
    if (prodAuditJson) {
      try {
        parseAndRecordAudit(prodAuditJson);
      } catch {
        this.addIssue({
          severity: "medium",
          type: "audit-failed",
          message: "Could not parse production dependency audit output",
          recommendation:
            "Manually run `npm audit --omit=dev` to check for vulnerabilities",
        });
      }
    } else {
      this.addIssue({
        severity: "medium",
        type: "audit-failed",
        message: "Could not run production dependency audit",
        recommendation:
          "Manually run `npm audit --omit=dev` to check for vulnerabilities",
      });
    }

    // Report dev-only vulnerabilities as non-blocking info.
    const fullAuditJson = runAuditJson("npm audit --json");
    if (fullAuditJson) {
      try {
        parseAndRecordAudit(fullAuditJson, {
          type: "dev-dependency-vulnerability",
          severityOverride: "low",
          recommendationOverride:
            "Review dev dependency vulnerabilities (non-blocking). Consider `npm audit fix` or dependency bumps.",
        });
      } catch {
        // Ignore dev audit parse issues; production audit is the gate.
      }
    }
  }

  // Check Content Security Policy
  private checkCSPConfiguration() {
    const securityConfigFile = join(this.projectRoot, "src/utils/security.ts");

    if (!existsSync(securityConfigFile)) {
      this.addIssue({
        severity: "high",
        type: "missing-csp",
        message: "No Content Security Policy configuration found",
        recommendation: "Implement CSP configuration in src/utils/security.ts",
      });
      return;
    }

    try {
      const content = readFileSync(securityConfigFile, "utf8");

      // Check for unsafe CSP directives
      if (
        content.includes("'unsafe-eval'") &&
        !content.includes("import.meta.env.DEV")
      ) {
        this.addIssue({
          severity: "medium",
          type: "unsafe-csp-directive",
          message: "unsafe-eval found in CSP without development guard",
          file: securityConfigFile,
          recommendation: "Only allow unsafe-eval in development mode",
        });
      }

      if (
        content.includes("'unsafe-inline'") &&
        !content.includes("Required for")
      ) {
        this.addIssue({
          severity: "medium",
          type: "unsafe-csp-directive",
          message: "unsafe-inline found without justification comment",
          file: securityConfigFile,
          recommendation: "Document why unsafe-inline is required",
        });
      }
    } catch {
      // Skip if can't read file
    }
  }

  // Check HTTPS configuration
  private checkHTTPSConfiguration() {
    const netlifyConfigFile = join(this.projectRoot, "netlify.toml");

    if (existsSync(netlifyConfigFile)) {
      try {
        const content = readFileSync(netlifyConfigFile, "utf8");

        if (!content.includes("Strict-Transport-Security")) {
          this.addIssue({
            severity: "medium",
            type: "missing-hsts",
            message: "Missing HSTS header in netlify.toml",
            file: "netlify.toml",
            recommendation: "Add Strict-Transport-Security header",
          });
        }
      } catch {
        // Skip if can't read file
      }
    }
  }

  // Run all security checks
  public audit(): SecurityIssue[] {
    console.log("🔒 Running security audit...\n");

    this.checkHardcodedSecrets();
    this.checkEnvironmentConfig();
    this.checkDependencyVulnerabilities();
    this.checkCSPConfiguration();
    this.checkHTTPSConfiguration();

    return this.issues;
  }

  // Generate security report
  public generateReport(): void {
    const issues = this.audit();

    if (issues.length === 0) {
      console.log("✅ No security issues found!");
      return;
    }

    console.log(`Found ${issues.length} security issues:\n`);

    const severityOrder = ["critical", "high", "medium", "low"];
    const groupedIssues = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.severity]) acc[issue.severity] = [];
        acc[issue.severity].push(issue);
        return acc;
      },
      {} as Record<string, SecurityIssue[]>
    );

    severityOrder.forEach((severity) => {
      const severityIssues = groupedIssues[severity];
      if (!severityIssues) return;

      const icon =
        {
          critical: "🚨",
          high: "⚠️",
          medium: "⚡",
          low: "💡",
        }[severity] || "•";

      console.log(
        `${icon} ${severity.toUpperCase()} (${severityIssues.length}):`
      );

      severityIssues.forEach((issue) => {
        console.log(`  • ${issue.message}`);
        if (issue.file) console.log(`    📁 ${issue.file}`);
        console.log(`    💡 ${issue.recommendation}\n`);
      });
    });

    // Summary
    const criticalCount = groupedIssues.critical?.length || 0;
    const highCount = groupedIssues.high?.length || 0;

    if (criticalCount > 0 || highCount > 0) {
      console.log(
        `🚨 Security audit failed: ${criticalCount} critical, ${highCount} high severity issues`
      );
      process.exit(1);
    } else {
      console.log("⚠️ Security audit completed with warnings");
    }
  }
}

// Run audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new SecurityAuditor();
  auditor.generateReport();
}

export { SecurityAuditor };
