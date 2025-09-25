#!/usr/bin/env node

/**
 * Design System Audit Script
 * Scans the codebase for design system compliance issues
 * - Detects hardcoded color classes (e.g., text-red-500, bg-blue-600)
 * - Ensures semantic design system classes are used
 * - Reports violations with file locations and suggested fixes
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'generated-themes.css',
  'generated-tokens.css',
  'designSystemMapping.ts'
];

// Hardcoded color patterns to detect
const HARDCODED_COLOR_PATTERNS = [
  // Tailwind color classes
  /\b(text|bg|border|ring|divide|placeholder|from|via|to)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/g,
  // Specific color names
  /\b(text|bg|border|ring|divide|placeholder|from|via|to)-(white|black|transparent|current|inherit)\b/g,
  // Hex colors in class names
  /\b(text|bg|border|ring|divide|placeholder|from|via|to)-\[#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})\]\b/g,
  // Arbitrary values with colors
  /\b(text|bg|border|ring|divide|placeholder|from|via|to)-\[.*?(#[a-fA-F0-9]{3,8}|rgb\(|hsl\(|rgba\(|hsla\().*?\]\b/g,
];

// Semantic design system classes (allowed)
const SEMANTIC_CLASSES = [
  'text-text-primary',
  'text-text-secondary',
  'text-text-tertiary',
  'text-text-inverse',
  'text-text-accent',
  'text-text-error',
  'text-text-success',
  'text-text-warning',
  'text-text-info',
  'bg-background',
  'bg-surface-primary',
  'bg-surface-secondary',
  'bg-surface-tertiary',
  'bg-surface-accent',
  'bg-surface-error',
  'bg-surface-success',
  'bg-surface-warning',
  'bg-surface-info',
  'border-border',
  'border-border-light',
  'border-border-dark',
  'border-border-accent',
  'ring-ring',
  'ring-ring-focus',
  'divide-border',
  'placeholder-text-secondary',
  'from-gradient-start',
  'via-gradient-middle',
  'to-gradient-end',
];

// Audit results
interface AuditResult {
  file: string;
  line: number;
  column: number;
  violation: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

class DesignSystemAuditor {
  private results: AuditResult[] = [];
  private filesScanned = 0;
  private totalViolations = 0;

  scanDirectory(dirPath: string, baseDir = dirPath): void {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = relative(baseDir, fullPath);

      // Skip ignored patterns
      if (IGNORE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
        continue;
      }

      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, baseDir);
      } else if (SCAN_EXTENSIONS.includes(extname(fullPath))) {
        this.scanFile(fullPath, relativePath);
      }
    }
  }

  private scanFile(filePath: string, relativePath: string): void {
    this.filesScanned++;
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      this.checkLine(line, lineIndex + 1, relativePath, filePath);
    });
  }

  private checkLine(line: string, lineNumber: number, relativePath: string, _filePath: string): void {
    // Check for hardcoded color patterns
    for (const pattern of HARDCODED_COLOR_PATTERNS) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const violation = match[0];
        const column = match.index + 1;

        // Check if this is actually a semantic class (false positive)
        if (this.isSemanticClass(violation)) {
          continue;
        }

        this.results.push({
          file: relativePath,
          line: lineNumber,
          column,
          violation,
          suggestion: this.getSuggestion(violation),
          severity: 'error'
        });

        this.totalViolations++;
      }
    }

    // Check for inline styles with colors (warning)
    const inlineStylePattern = /style=\{[^}]*?(background|color|border|backgroundColor|borderColor):\s*['"](#[a-fA-F0-9]{3,8}|rgb\([^)]+\)|hsl\([^)]+\))['"]/g;
    let match;
    while ((match = inlineStylePattern.exec(line)) !== null) {
      this.results.push({
        file: relativePath,
        line: lineNumber,
        column: match.index + 1,
        violation: match[0],
        suggestion: 'Use semantic design system classes instead of inline styles',
        severity: 'warning'
      });
      this.totalViolations++;
    }
  }

  private isSemanticClass(className: string): boolean {
    return SEMANTIC_CLASSES.some(semantic => className.includes(semantic));
  }

  private getSuggestion(violation: string): string {
    // Extract the property type (text, bg, border, etc.)
    const propertyMatch = violation.match(/^(text|bg|border|ring|divide|placeholder|from|via|to)-/);
    if (!propertyMatch) return 'Use semantic design system classes';

    const property = propertyMatch[1];
    const colorPart = violation.replace(`${property}-`, '');

    // Map common hardcoded colors to semantic equivalents
    const colorMappings: Record<string, string> = {
      'white': 'surface-primary',
      'black': 'text-primary',
      'gray-500': 'text-secondary',
      'gray-600': 'text-tertiary',
      'gray-400': 'text-secondary',
      'gray-300': 'border-light',
      'gray-200': 'border',
      'gray-100': 'surface-secondary',
      'red-500': 'text-error',
      'red-600': 'text-error',
      'green-500': 'text-success',
      'green-600': 'text-success',
      'blue-500': 'text-info',
      'blue-600': 'text-info',
      'yellow-500': 'text-warning',
      'yellow-600': 'text-warning',
      'jade-500': 'text-accent',
      'jade-600': 'text-accent',
      'electric-500': 'text-accent',
      'electric-600': 'text-accent',
    };

    const semanticColor = colorMappings[colorPart];
    if (semanticColor) {
      const semanticProperty = property === 'text' ? 'text' :
                              property === 'bg' ? 'bg' :
                              property === 'border' ? 'border' :
                              property === 'ring' ? 'ring' :
                              property === 'divide' ? 'divide' :
                              property === 'placeholder' ? 'placeholder' :
                              property;
      return `Use ${semanticProperty}-${semanticColor} instead`;
    }

    return 'Use semantic design system classes from generated-themes.css';
  }

  generateReport(): void {
    console.log('🎨 Design System Audit Report');
    console.log('=' .repeat(50));
    console.log(`Files scanned: ${this.filesScanned}`);
    console.log(`Total violations: ${this.totalViolations}`);
    console.log('');

    if (this.results.length === 0) {
      console.log('✅ No design system violations found!');
      return;
    }

    // Group by file
    const byFile = this.results.reduce((acc, result) => {
      if (!acc[result.file]) acc[result.file] = [];
      acc[result.file].push(result);
      return acc;
    }, {} as Record<string, AuditResult[]>);

    // Sort files by number of violations
    const sortedFiles = Object.entries(byFile).sort(([,a], [,b]) => b.length - a.length);

    for (const [file, violations] of sortedFiles) {
      console.log(`📁 ${file} (${violations.length} violations)`);
      console.log('-'.repeat(40));

      for (const violation of violations) {
        const severityIcon = violation.severity === 'error' ? '❌' : '⚠️';
        console.log(`${severityIcon} Line ${violation.line}:${violation.column} - ${violation.violation}`);
        console.log(`   💡 ${violation.suggestion}`);
        console.log('');
      }
    }

    // Summary by severity
    const errors = this.results.filter(r => r.severity === 'error').length;
    const warnings = this.results.filter(r => r.severity === 'warning').length;

    console.log('📊 Summary:');
    console.log(`   Errors: ${errors}`);
    console.log(`   Warnings: ${warnings}`);
    console.log('');

    if (errors > 0) {
      console.log('❌ Design system compliance failed. Please fix the errors above.');
      process.exit(1);
    } else {
      console.log('✅ Design system compliance passed with warnings. Consider fixing warnings for better consistency.');
    }
  }

  getResults(): AuditResult[] {
    return this.results;
  }
}

// Main execution
function main() {
  const auditor = new DesignSystemAuditor();

  console.log('🔍 Scanning codebase for design system compliance...\n');

  // Start from src directory
  const srcDir = join(__dirname, '..', 'src');
  auditor.scanDirectory(srcDir);

  auditor.generateReport();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DesignSystemAuditor, type AuditResult };