import {
  colorTokens,
  semanticTokens,
  typographyTokens,
  semanticTypographyTokens,
  animationTokens,
  semanticAnimationTokens,
  spacingTokens,
  fineSpacingTokens,
  semanticSpacingTokens,
  densityTokens,
  opacityTokens,
  borderRadiusTokens,
  semanticBorderRadiusTokens,
  borderTokens,
  semanticBorderTokens,
  elevationTokens,
  contrastTokens,
  componentTokens,
  layoutTokens,
  semanticLayoutTokens,
} from "../../src/design-system/tokens";
import { writeFileSync } from "fs";

function toKebab(key: string) {
  return key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

function normalizeValue(val: unknown): string {
  if (typeof val === "string") {
    // Lower-case hex colors
    if (/^#?[0-9A-F]{3,8}$/.test(val)) return val.toLowerCase();
    // Add spacing after commas in font stacks
    if (/,/.test(val) && /(Mono|Inter|Bebas|system-ui|Consolas)/.test(val)) {
      return val
        .split(",")
        .map((p) => p.trim())
        .join(", ");
    }
    return val;
  }
  return String(val);
}

function emitObj(
  prefix: string,
  obj: Record<string, unknown>,
  lines: string[]
) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v && !Array.isArray(v)) {
      emitObj(`${prefix}-${toKebab(k)}`, v as Record<string, unknown>, lines);
    } else {
      const norm = normalizeValue(v);
      // Keep elevation (box-shadow lists) in single line for Prettier friendly diffing
      const value = norm
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      lines.push(`  --${prefix}-${toKebab(k)}: ${value};`);
    }
  }
}

type Nested = Record<string, unknown>;

interface TypographyDef {
  fontFamily: Nested;
  fontSize: Nested;
  [k: string]: unknown;
}

const HEADER_LINES = [
  "/**",
  " * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY",
  " *",
  " * This file is generated from src/design-system/tokens.ts",
  " * Run: npm run tokens:generate",
  " */",
  "",
];

export function generateTokensCSS(): string {
  const lines: string[] = [...HEADER_LINES, ":root {"];

  // Color system
  emitObj("color", colorTokens as Record<string, unknown>, lines);
  emitObj("semantic", semanticTokens as Record<string, unknown>, lines);

  // Typography
  const typo = typographyTokens as unknown as TypographyDef;
  emitObj("font-family", typo.fontFamily as Nested, lines);
  emitObj("font-size", typo.fontSize as Nested, lines);
  emitObj("font-weight", typo.fontWeight as Nested, lines);
  emitObj("line-height", typo.lineHeight as Nested, lines);
  emitObj("letter-spacing", typo.letterSpacing as Nested, lines);
  emitObj(
    "semantic-typography",
    semanticTypographyTokens as Record<string, unknown>,
    lines
  );

  // Animation system
  emitObj("animation", animationTokens as Record<string, unknown>, lines);
  emitObj(
    "semantic-animation",
    semanticAnimationTokens as Record<string, unknown>,
    lines
  );

  // Spacing system
  emitObj("space", spacingTokens as Record<string, unknown>, lines);
  emitObj("fine-spacing", fineSpacingTokens as Record<string, unknown>, lines);
  emitObj(
    "semantic-spacing",
    semanticSpacingTokens as Record<string, unknown>,
    lines
  );

  // Layout tokens
  emitObj("layout", layoutTokens as Record<string, unknown>, lines);
  emitObj(
    "semantic-layout",
    semanticLayoutTokens as Record<string, unknown>,
    lines
  );

  // Layout
  emitObj("density", densityTokens as Record<string, unknown>, lines);

  // Visual properties
  emitObj("opacity", opacityTokens as Record<string, unknown>, lines);

  // Border system
  emitObj("radius", borderRadiusTokens as Record<string, unknown>, lines);
  emitObj(
    "semantic-radius",
    semanticBorderRadiusTokens as Record<string, unknown>,
    lines
  );
  emitObj("border", borderTokens as Record<string, unknown>, lines);
  emitObj(
    "semantic-border",
    semanticBorderTokens as Record<string, unknown>,
    lines
  );

  // Elevation
  emitObj("elevation", elevationTokens as Record<string, unknown>, lines);

  // Contrast & accessibility
  emitObj("contrast", contrastTokens as Record<string, unknown>, lines);

  // Component-specific tokens
  emitObj("component", componentTokens as Record<string, unknown>, lines);

  lines.push("}");
  return lines.join("\n") + "\n"; // trailing newline for determinism
}

// Write to file when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const css = generateTokensCSS();
  writeFileSync("src/styles/generated-tokens.css", css);
  console.log("Generated tokens written to src/styles/generated-tokens.css");
}
