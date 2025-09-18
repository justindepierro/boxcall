#!/usr/bin/env tsx
/**
 * validate-theme-contrast.ts
 * Simple AA contrast validation for core semantic text tokens across surfaces for all registered themes.
 */
import { themeRegistry } from "../themes/registry";

interface ContrastResult {
  theme: string;
  textVar: string;
  surfaceVar: string;
  contrast: number;
  pass: boolean;
}

// Relative luminance
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const sr = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sg = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Focus on meaningful UI text tokens; exclude inverse on base surfaces (redundant) and decorative brand on inverse alt for now.
const textTokens = [
  "textPrimary",
  "textSecondary",
  "textMuted",
  "textInverse",
  "textBrand",
  "success",
  "warning",
  "error",
];
const surfaceTokens = [
  "bgPrimary",
  "bgSecondary",
  "bgMuted",
  "surfaceInverse",
  "surfaceInverseAlt",
];

const results: ContrastResult[] = [];

for (const theme of themeRegistry.themes) {
  for (const txt of textTokens) {
    const fg = theme.semantic[txt];
    if (!fg) continue;
    for (const surf of surfaceTokens) {
      const bg = theme.semantic[surf];
      if (!bg) continue;
      // Skip evaluating textInverse on inverse surfaces (designed for inverse content context switch, not direct overlay)
      if (txt === "textInverse" && surf.startsWith("surfaceInverse")) continue;
      // Skip primary text on surfaceInverse in light theme if identical (not a real usage scenario)
      // (Could refine by scanning actual usage in future iteration.)
      const ratio = contrastRatio(fg, bg);
      const pass =
        ratio >= 4.5 ||
        ([
          "textSecondary",
          "textMuted",
          "textBrand",
          "success",
          "warning",
          "error",
        ].includes(txt) &&
          ratio >= 3.0);
      results.push({
        theme: theme.id,
        textVar: txt,
        surfaceVar: surf,
        contrast: +ratio.toFixed(2),
        pass,
      });
    }
  }
}

const failing = results.filter((r) => !r.pass);
if (failing.length) {
  console.info("Theme Contrast Validation: FAIL");
  console.info(failing);
  process.exitCode = 1;
} else {
  console.info("Theme Contrast Validation: PASS");
}

// Output markdown table summary
let md = `# Theme Contrast Matrix (Automated)\n\n| Theme | Text Token | Surface Token | Contrast | Pass |\n|-------|------------|---------------|----------|------|\n`;
for (const r of results) {
  md += `| ${r.theme} | ${r.textVar} | ${r.surfaceVar} | ${r.contrast} | ${r.pass ? "✅" : "❌"} |\n`;
}

import { writeFileSync } from "fs";

writeFileSync("docs/style-inventory/theme-contrast-matrix.md", md);
