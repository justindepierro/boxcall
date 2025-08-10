#!/usr/bin/env ts-node
/**
 * Generate CSS variable layer from design tokens.
 * Usage: npx tsx scripts/generate-tokens-css.ts > src/styles/generated-tokens.css
 */
import { writeFileSync } from "fs";
import {
  colorTokens,
  semanticTokens,
  typographyTokens,
  spacingTokens,
  elevationTokens,
} from "../src/design-system/tokens";

function toKebab(key: string) {
  return key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

function emitObj(
  prefix: string,
  obj: Record<string, unknown>,
  lines: string[]
) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v && !Array.isArray(v))
      emitObj(`${prefix}-${toKebab(k)}`, v as Record<string, unknown>, lines);
    else lines.push(`  --${prefix}-${toKebab(k)}: ${v};`);
  }
}

const lines: string[] = [":root {"];
emitObj("color", colorTokens as unknown as Record<string, unknown>, lines);
emitObj(
  "semantic",
  semanticTokens as unknown as Record<string, unknown>,
  lines
);
emitObj(
  "font-family",
  typographyTokens.fontFamily as unknown as Record<string, unknown>,
  lines
);
emitObj(
  "font-size",
  typographyTokens.fontSize as unknown as Record<string, unknown>,
  lines
);
emitObj("space", spacingTokens as unknown as Record<string, unknown>, lines);
emitObj(
  "elevation",
  elevationTokens as unknown as Record<string, unknown>,
  lines
);
lines.push("}");

const out = lines.join("\n");
writeFileSync("src/styles/generated-tokens.css", out, "utf8");
console.log("Generated src/styles/generated-tokens.css");
