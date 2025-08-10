#!/usr/bin/env node
/**
 * scripts/contrast-matrix.mjs
 * Generates a basic contrast ratio matrix for text tokens on background surface tokens.
 * Placeholder initial implementation – expand with full palette & WCAG categorization later.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Minimal color set (extend later)
const text = {
  primary: "#111827",
  secondary: "#4B5563",
  inverse: "#FFFFFF",
  brand: "#047857",
  danger: "#DC2626",
};

const backgrounds = {
  white: "#FFFFFF",
  muted: "#F3F4F6",
  subtle: "#F9FAFB",
  card: "#FFFFFF",
  inverse: "#111827",
  inverseAlt: "#374151",
  brandSubtle: "#D1FAE5",
};

function luminance(hex) {
  const c = hex.replace("#", "");
  const rgb = [0, 1, 2]
    .map((i) => parseInt(c.slice(i * 2, i * 2 + 2), 16) / 255)
    .map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrastRatio(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

function wcagLevel(r) {
  if (r >= 7) return "AAA";
  if (r >= 4.5) return "AA";
  if (r >= 3) return "AA Large";
  return "Fail";
}

const rows = [];
for (const [tName, tColor] of Object.entries(text)) {
  for (const [bgName, bgColor] of Object.entries(backgrounds)) {
    const ratio = contrastRatio(tColor, bgColor);
    rows.push({
      tName,
      bgName,
      ratio: ratio.toFixed(2),
      level: wcagLevel(ratio),
    });
  }
}

// Sort failing first for visibility
rows.sort((a, b) => {
  const order = (lvl) => ({ Fail: 0, "AA Large": 1, AA: 2, AAA: 3 })[lvl];
  const diff = order(a.level) - order(b.level);
  if (diff !== 0) return diff;
  return parseFloat(b.ratio) - parseFloat(a.ratio);
});

function table(headers, data) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  return [head, sep, ...data.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

const md = [];
md.push("# Contrast Matrix (Initial)");
md.push(`Generated: ${new Date().toISOString()}`);
md.push(
  "> Placeholder implementation: limited token set. Will expand to full text × surface palette."
);
md.push("\n");
md.push(
  table(
    ["Text Token", "Background Token", "Contrast", "WCAG"],
    rows.map((r) => [r.tName, r.bgName, r.ratio, r.level])
  )
);

const outDir = join(process.cwd(), "docs/style-inventory");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "contrast-matrix.md");
writeFileSync(outPath, md.join("\n"), "utf8");
console.log("Contrast matrix written to", outPath);
