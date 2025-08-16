#!/usr/bin/env node
/**
 * scripts/contrast-baseline.mjs
 * Baseline contrast issue scan combining:
 *  - Button variant foreground/background assumptions (including surfaces)
 *  - Text token × Background token matrix
 * Outputs:
 *  - docs/style-inventory/contrast-baseline-report.md (human readable)
 *  - docs/style-inventory/contrast-baseline.json (machine data)
 * Severity Heuristic:
 *   ratio < 3.0        => HIGH (fails even large text AA)
 *   3.0 <= ratio < 4.5 => MEDIUM (fails normal text AA)
 * (We treat >=4.5 as pass; AAA not required baseline.)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Palette subset (align with existing contrast-check & contrast-matrix scripts)
const palette = {
  jade: { 500: "#00A86B", 600: "#047857", 700: "#065F46" },
  navy: { 500: "#64748B", 600: "#475569", 700: "#334155" },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
  red: { 600: "#DC2626", 700: "#B91C1C" },
  yellow: { 600: "#D97706", 700: "#B45309" },
  white: "#FFFFFF",
};

// Text tokens & background tokens (from contrast-matrix)
const textTokens = {
  primary: "#111827",
  secondary: "#4B5563",
  inverse: "#FFFFFF",
  brand: "#047857",
  // Darkened danger token from 600 to 700 shade to clear AA on muted & brandSubtle backgrounds
  danger: "#B91C1C",
};
const backgroundTokens = {
  white: "#FFFFFF",
  muted: "#F3F4F6",
  subtle: "#F9FAFB",
  card: "#FFFFFF",
  inverse: "#111827",
  inverseAlt: "#374151",
  brandSubtle: "#D1FAE5",
};

// Compatibility map: which background tokens a given text token is *intended* to appear on.
// This lets us filter out theoretical pairings that are never meant to ship and would otherwise
// inflate "HIGH" issue counts with noise. The goal is to gate on *real* design intent.
const textBackgroundCompatibility = {
  primary: ["white", "muted", "subtle", "card", "brandSubtle"],
  secondary: ["white", "muted", "subtle", "card", "brandSubtle"],
  brand: ["white", "muted", "subtle", "card", "brandSubtle"],
  danger: ["white", "muted", "subtle", "card", "brandSubtle"],
  // inverse text is only meant for dark / inverse surfaces (and occasionally solid brand fills – not modeled here)
  inverse: ["inverse", "inverseAlt"],
};

function isIntendedPair(textToken, backgroundToken) {
  const allowed = textBackgroundCompatibility[textToken];
  return allowed ? allowed.includes(backgroundToken) : true;
}

// Button variants (mirrors contrast-check)
const buttonSurfaces = {
  white: palette.white,
  gray50: palette.gray[50],
  gray100: palette.gray[100],
};
const buttonVariants = [
  { name: "primary", fg: palette.white, bg: palette.jade[600] },
  {
    name: "secondary",
    fg: palette.navy[600],
    bg: "transparent",
    testOn: ["white", "gray50", "gray100"],
  },
  {
    name: "outline",
    fg: palette.jade[600],
    bg: "transparent",
    testOn: ["white", "gray50", "gray100"],
  },
  {
    name: "ghost",
    fg: palette.gray[600],
    bg: "transparent",
    testOn: ["white", "gray50", "gray100"],
  },
  {
    name: "link",
    fg: palette.jade[600],
    bg: "transparent",
    testOn: ["white", "gray50", "gray100"],
  },
  { name: "danger", fg: palette.white, bg: palette.red[600] },
  { name: "success", fg: palette.white, bg: palette.jade[600] },
  { name: "warning", fg: palette.gray[900], bg: palette.yellow[600] },
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
function channelToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function severityFromRatio(r) {
  if (r < 3) return "HIGH";
  if (r < 4.5) return "MEDIUM";
  return null; // pass
}

const issues = [];

// Text × Background matrix
for (const [tName, tColor] of Object.entries(textTokens)) {
  for (const [bgName, bgColor] of Object.entries(backgroundTokens)) {
    if (!isIntendedPair(tName, bgName)) continue; // skip non-design-intent combos
    const ratio = contrastRatio(tColor, bgColor);
    const sev = severityFromRatio(ratio);
    if (sev) {
      issues.push({
        category: "text-token",
        textToken: tName,
        backgroundToken: bgName,
        fg: tColor,
        bg: bgColor,
        ratio: Number(ratio.toFixed(2)),
        severity: sev,
        guideline:
          sev === "HIGH" ? "<3 fails AA Large" : "<4.5 fails AA Normal",
      });
    }
  }
}

// Button variants
buttonVariants.forEach((v) => {
  if (v.bg !== "transparent") {
    const ratio = contrastRatio(v.fg, v.bg);
    const sev = severityFromRatio(ratio);
    if (sev) {
      issues.push({
        category: "button-variant",
        variant: v.name,
        surface: "self-bg",
        fg: v.fg,
        bg: v.bg,
        ratio: Number(ratio.toFixed(2)),
        severity: sev,
        guideline:
          sev === "HIGH" ? "<3 fails AA Large" : "<4.5 fails AA Normal",
      });
    }
  } else {
    v.testOn.forEach((surfaceKey) => {
      const surfaceColor = buttonSurfaces[surfaceKey];
      const ratio = contrastRatio(v.fg, surfaceColor);
      const sev = severityFromRatio(ratio);
      if (sev) {
        issues.push({
          category: "button-variant",
          variant: v.name,
          surface: surfaceKey,
          fg: v.fg,
          bg: surfaceColor,
          ratio: Number(ratio.toFixed(2)),
          severity: sev,
          guideline:
            sev === "HIGH" ? "<3 fails AA Large" : "<4.5 fails AA Normal",
        });
      }
    });
  }
});

issues.sort((a, b) =>
  a.severity === b.severity ? b.ratio - a.ratio : a.severity === "HIGH" ? -1 : 1
);

const totals = issues.reduce((acc, i) => {
  acc[i.severity] = (acc[i.severity] || 0) + 1;
  return acc;
}, {});
const totalIssues = issues.length;

// Markdown output
function mdTable(rows) {
  const header =
    "| Category | Item | Surface | FG | BG | Ratio | Severity | Guideline |";
  const sep =
    "|----------|------|---------|----|----|-------|----------|-----------|";
  const lines = rows.map((r) => {
    const item = r.category === "text-token" ? r.textToken : r.variant;
    const surface = r.category === "text-token" ? r.backgroundToken : r.surface;
    return `| ${r.category} | ${item} | ${surface} | ${r.fg} | ${r.bg} | ${r.ratio.toFixed(2)} | ${r.severity} | ${r.guideline} |`;
  });
  return [header, sep, ...lines].join("\n");
}

const outDir = join(process.cwd(), "docs/style-inventory");
mkdirSync(outDir, { recursive: true });

const jsonPath = join(outDir, "contrast-baseline.json");
writeFileSync(
  jsonPath,
  JSON.stringify(
    { generated: new Date().toISOString(), totalIssues, totals, issues },
    null,
    2
  )
);

const mdParts = [];
mdParts.push("# Contrast Baseline Report");
mdParts.push(`Generated: ${new Date().toISOString()}`);
mdParts.push("\nSummary:");
mdParts.push(
  `Total issues: ${totalIssues} (High: ${totals.HIGH || 0}, Medium: ${totals.MEDIUM || 0})`
);
mdParts.push("\nSeverity Legend:");
mdParts.push("- HIGH: Contrast ratio < 3 (fails AA even for large text)");
mdParts.push("- MEDIUM: 3 ≤ ratio < 4.5 (fails AA normal text)");
mdParts.push("\nNext Actions:");
mdParts.push("1. Address HIGH issues first (adjust token or variant color).");
mdParts.push(
  "2. Evaluate MEDIUM items for actual usage with font-size/weight (some may be acceptable for large text)."
);
mdParts.push(
  "3. Integrate automated gate after remediation (exit non-zero on remaining HIGH issues)."
);
mdParts.push("\n---\n");
mdParts.push(mdTable(issues));

const mdPath = join(outDir, "contrast-baseline-report.md");
writeFileSync(mdPath, mdParts.join("\n"));
console.log(
  `Contrast baseline complete: ${totalIssues} issues (High: ${totals.HIGH || 0}, Medium: ${totals.MEDIUM || 0})`
);
console.log("Markdown:", mdPath);
console.log("JSON:", jsonPath);

process.exit(0);
