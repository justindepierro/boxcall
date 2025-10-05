#!/usr/bin/env tsx
/**
 * Token Replacement Suggestion Tool
 * 
 * This is a SAFE, INTERACTIVE helper tool that:
 * - Finds hardcoded design values in files
 * - Suggests appropriate token replacements
 * - Shows before/after preview
 * - Requires manual confirmation for each change
 * - Does NOT auto-replace anything
 * 
 * Philosophy: Human in the loop, automation as assistant
 * 
 * Usage: tsx scripts/suggest-token-replacements.ts [file-path]
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as readline from "readline";
import pc from "picocolors";

// ============================================================================
// TYPES
// ============================================================================

interface Violation {
  type: "arbitrary-font" | "arbitrary-height" | "arbitrary-width" | "arbitrary-spacing" | "hex-color" | "rgba-color";
  line: number;
  column: number;
  original: string;
  context: string; // surrounding code
  suggestion: Replacement;
}

interface Replacement {
  value: string;
  reasoning: string;
  tradeoff?: string;
  confidence: "high" | "medium" | "low";
}

interface FileAnalysis {
  filePath: string;
  violations: Violation[];
  totalLines: number;
}

// ============================================================================
// SUGGESTION RULES (Based on Badge.tsx learnings)
// ============================================================================

/**
 * Suggest replacement for arbitrary font sizes
 */
function suggestFontReplacement(value: string): Replacement {
  const pxValue = parseInt(value.replace(/[^\d]/g, ""));
  
  // Tailwind font scale
  const fontScale: Record<string, { px: number; class: string }> = {
    "text-xs": { px: 12, class: "text-xs" },
    "text-sm": { px: 14, class: "text-sm" },
    "text-base": { px: 16, class: "text-base" },
    "text-lg": { px: 18, class: "text-lg" },
    "text-xl": { px: 20, class: "text-xl" },
  };

  // Find closest match
  let closest = "text-xs";
  let minDiff = Infinity;

  for (const [className, { px }] of Object.entries(fontScale)) {
    const diff = Math.abs(px - pxValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = className;
    }
  }

  const suggestedPx = fontScale[closest].px;
  const diff = suggestedPx - pxValue;
  const diffStr = diff > 0 ? `+${diff}px` : `${diff}px`;

  return {
    value: closest,
    reasoning: `Closest standard font size. ${pxValue}px → ${suggestedPx}px (${diffStr})`,
    tradeoff: Math.abs(diff) > 2 ? "⚠️ Difference > 2px, may be noticeable" : undefined,
    confidence: Math.abs(diff) <= 2 ? "high" : "medium",
  };
}

/**
 * Suggest replacement for arbitrary heights
 */
function suggestHeightReplacement(value: string): Replacement {
  const pxValue = parseInt(value.replace(/[^\d]/g, ""));
  
  // Tailwind height scale (4px increments)
  const heightScale: Record<string, number> = {
    "h-4": 16,
    "h-5": 20,
    "h-6": 24,
    "h-7": 28,
    "h-8": 32,
    "h-9": 36,
    "h-10": 40,
    "h-12": 48,
    "h-14": 56,
    "h-16": 64,
  };

  // Find closest match
  let closest = "h-4";
  let minDiff = Infinity;

  for (const [className, px] of Object.entries(heightScale)) {
    const diff = Math.abs(px - pxValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = className;
    }
  }

  const suggestedPx = heightScale[closest];
  const diff = suggestedPx - pxValue;
  const diffStr = diff > 0 ? `+${diff}px` : `${diff}px`;

  return {
    value: closest,
    reasoning: `Aligns with 4px spacing grid. ${pxValue}px → ${suggestedPx}px (${diffStr})`,
    tradeoff: Math.abs(diff) > 4 ? "⚠️ Large difference, verify visually" : undefined,
    confidence: Math.abs(diff) <= 4 ? "high" : "medium",
  };
}

/**
 * Suggest replacement for arbitrary width
 */
function suggestWidthReplacement(value: string): Replacement {
  const pxValue = parseInt(value.replace(/[^\d]/g, ""));
  
  // Similar to height but with w- prefix
  const widthScale: Record<string, number> = {
    "w-4": 16,
    "w-5": 20,
    "w-6": 24,
    "w-8": 32,
    "w-10": 40,
    "w-12": 48,
    "w-16": 64,
    "w-20": 80,
    "w-24": 96,
  };

  let closest = "w-4";
  let minDiff = Infinity;

  for (const [className, px] of Object.entries(widthScale)) {
    const diff = Math.abs(px - pxValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = className;
    }
  }

  const suggestedPx = widthScale[closest];
  const diff = suggestedPx - pxValue;
  const diffStr = diff > 0 ? `+${diff}px` : `${diff}px`;

  return {
    value: closest,
    reasoning: `Standard width utility. ${pxValue}px → ${suggestedPx}px (${diffStr})`,
    tradeoff: Math.abs(diff) > 4 ? "⚠️ Large difference, verify visually" : undefined,
    confidence: Math.abs(diff) <= 4 ? "high" : "medium",
  };
}

/**
 * Suggest replacement for arbitrary spacing (padding, margin, gap)
 */
function suggestSpacingReplacement(value: string, property: string): Replacement {
  const pxValue = parseInt(value.replace(/[^\d]/g, ""));
  
  // Tailwind spacing scale
  const spacingScale: Record<string, number> = {
    "0": 0,
    "0.5": 2,
    "1": 4,
    "1.5": 6,
    "2": 8,
    "2.5": 10,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
  };

  let closest = "0";
  let minDiff = Infinity;

  for (const [key, px] of Object.entries(spacingScale)) {
    const diff = Math.abs(px - pxValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = key;
    }
  }

  const suggestedPx = spacingScale[closest];
  const diff = suggestedPx - pxValue;
  const diffStr = diff > 0 ? `+${diff}px` : `${diff}px`;

  return {
    value: `${property}-${closest}`,
    reasoning: `Standard spacing scale. ${pxValue}px → ${suggestedPx}px (${diffStr})`,
    tradeoff: Math.abs(diff) > 2 ? "⚠️ May affect layout rhythm" : undefined,
    confidence: Math.abs(diff) <= 2 ? "high" : "medium",
  };
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Find arbitrary font size values
 */
function findArbitraryFonts(_content: string, lines: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /text-\[(\d+)px\]/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      violations.push({
        type: "arbitrary-font",
        line: index + 1,
        column: match.index,
        original: match[0],
        context: line.trim(),
        suggestion: suggestFontReplacement(match[1]),
      });
    }
  });

  return violations;
}

/**
 * Find arbitrary height values
 */
function findArbitraryHeights(_content: string, lines: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /(?:min-)?h-\[(\d+)px\]/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      violations.push({
        type: "arbitrary-height",
        line: index + 1,
        column: match.index,
        original: match[0],
        context: line.trim(),
        suggestion: suggestHeightReplacement(match[1]),
      });
    }
  });

  return violations;
}

/**
 * Find arbitrary width values
 */
function findArbitraryWidths(_content: string, lines: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /(?:min-|max-)?w-\[(\d+)px\]/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      violations.push({
        type: "arbitrary-width",
        line: index + 1,
        column: match.index,
        original: match[0],
        context: line.trim(),
        suggestion: suggestWidthReplacement(match[1]),
      });
    }
  });

  return violations;
}

/**
 * Find arbitrary spacing values (padding, margin, gap)
 */
function findArbitrarySpacing(_content: string, lines: string[]): Violation[] {
  const violations: Violation[] = [];
  const pattern = /(p[xytrbl]?|m[xytrbl]?|gap)-\[(\d+)px\]/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      violations.push({
        type: "arbitrary-spacing",
        line: index + 1,
        column: match.index,
        original: match[0],
        context: line.trim(),
        suggestion: suggestSpacingReplacement(match[2], match[1]),
      });
    }
  });

  return violations;
}

// ============================================================================
// FILE ANALYSIS
// ============================================================================

/**
 * Analyze a file for design token violations
 */
function analyzeFile(filePath: string): FileAnalysis {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const violations: Violation[] = [
    ...findArbitraryFonts(content, lines),
    ...findArbitraryHeights(content, lines),
    ...findArbitraryWidths(content, lines),
    ...findArbitrarySpacing(content, lines),
  ];

  // Sort by line number
  violations.sort((a, b) => a.line - b.line);

  return {
    filePath,
    violations,
    totalLines: lines.length,
  };
}

// ============================================================================
// INTERACTIVE UI
// ============================================================================

/**
 * Display violation with suggestion
 */
function displayViolation(violation: Violation, index: number, total: number): void {
  console.log("\n" + pc.cyan("═".repeat(80)));
  console.log(pc.bold(`Violation ${index + 1} of ${total}`));
  console.log(pc.cyan("═".repeat(80)));
  
  console.log(pc.dim(`Line ${violation.line}:`));
  console.log(pc.white(violation.context));
  console.log("");
  
  console.log(pc.red(`  ❌ Found: ${violation.original}`));
  console.log(pc.green(`  ✅ Suggest: ${violation.suggestion.value}`));
  console.log("");
  
  console.log(pc.dim(`  💡 ${violation.suggestion.reasoning}`));
  
  if (violation.suggestion.tradeoff) {
    console.log(pc.yellow(`  ${violation.suggestion.tradeoff}`));
  }
  
  const confidenceColor = {
    high: pc.green,
    medium: pc.yellow,
    low: pc.red,
  }[violation.suggestion.confidence];
  
  console.log(confidenceColor(`  🎯 Confidence: ${violation.suggestion.confidence.toUpperCase()}`));
}

/**
 * Prompt user for action
 */
async function promptAction(): Promise<"accept" | "skip" | "quit"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      pc.bold("\n  [A]ccept | [S]kip | [Q]uit: "),
      (answer) => {
        rl.close();
        const choice = answer.toLowerCase().trim();
        
        if (choice === "a" || choice === "accept") {
          resolve("accept");
        } else if (choice === "s" || choice === "skip") {
          resolve("skip");
        } else if (choice === "q" || choice === "quit") {
          resolve("quit");
        } else {
          resolve("skip"); // default
        }
      }
    );
  });
}

/**
 * Apply replacement to file
 */
function applyReplacement(filePath: string, violation: Violation): void {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  // Replace the specific occurrence on the specific line
  const line = lines[violation.line - 1];
  lines[violation.line - 1] = line.replace(violation.original, violation.suggestion.value);
  
  writeFileSync(filePath, lines.join("\n"), "utf-8");
  console.log(pc.green(`  ✅ Replacement applied!`));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(pc.red("❌ Error: No file path provided"));
    console.log(pc.dim("Usage: tsx scripts/suggest-token-replacements.ts <file-path>"));
    process.exit(1);
  }

  const filePath = join(process.cwd(), args[0]);
  
  console.log(pc.bold(pc.cyan("\n🔍 Token Replacement Suggestion Tool\n")));
  console.log(pc.dim(`Analyzing: ${filePath}\n`));

  const analysis = analyzeFile(filePath);

  if (analysis.violations.length === 0) {
    console.log(pc.green("✅ No violations found! This file is already token-compliant."));
    process.exit(0);
  }

  console.log(pc.yellow(`Found ${analysis.violations.length} violations\n`));

  let acceptedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < analysis.violations.length; i++) {
    const violation = analysis.violations[i];
    
    displayViolation(violation, i, analysis.violations.length);
    
    const action = await promptAction();
    
    if (action === "accept") {
      applyReplacement(filePath, violation);
      acceptedCount++;
    } else if (action === "skip") {
      console.log(pc.dim("  ⏭️  Skipped"));
      skippedCount++;
    } else if (action === "quit") {
      console.log(pc.yellow("\n\n⏹️  Stopped by user"));
      break;
    }
  }

  // Summary
  console.log("\n" + pc.cyan("═".repeat(80)));
  console.log(pc.bold("Summary"));
  console.log(pc.cyan("═".repeat(80)));
  console.log(pc.green(`✅ Accepted: ${acceptedCount}`));
  console.log(pc.yellow(`⏭️  Skipped: ${skippedCount}`));
  console.log(pc.dim(`📊 Total: ${analysis.violations.length}`));
  console.log("");

  if (acceptedCount > 0) {
    console.log(pc.green(`🎉 ${acceptedCount} replacements applied to ${filePath}`));
    console.log(pc.dim("   Don't forget to test the changes!"));
  }
}

main().catch((error) => {
  console.error(pc.red("❌ Error:"), error);
  process.exit(1);
});
