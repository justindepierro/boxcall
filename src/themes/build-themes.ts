#!/usr/bin/env ts-node
/**
 * Build theme CSS blocks from registry.
 * Writes: src/styles/generated-themes.css
 */
import { writeFileSync } from "fs";
import { themeRegistry } from "./registry";

function normalize(val: string): string {
  // Lowercase hex codes
  if (/^#?[0-9A-F]{3,8}$/.test(val)) return val.toLowerCase();
  // Add spaces after commas in rgba()
  if (/^rgba\(/i.test(val)) {
    return val
      .replace(/rgba\(([^)]+)\)/i, (_, inner) =>
        `rgba(${inner.split(/\s*,\s*/).join(", ")})`
      );
  }
  return val;
}

function toCSSVars(prefix: string, obj: Record<string, string>): string[] {
  return Object.entries(obj).map(([k, v]) => {
    const key = k.replace(/([A-Z])/g, "-$1").toLowerCase();
    return `  --${prefix}-${key}: ${normalize(v)};`;
  });
}

const lines: string[] = [];
for (const theme of themeRegistry.themes) {
  const selector =
    theme.id === themeRegistry.baseId ? ":root" : `[data-theme="${theme.id}"]`;
  lines.push(`${selector} {`);
  lines.push(
    ...toCSSVars("color", {
      /* palette intentionally minimal here */
    })
  );
  lines.push(
    ...toCSSVars(
      "semantic",
      theme.semantic as unknown as Record<string, string>
    )
  );
  if (theme.component) {
    for (const [comp, tokens] of Object.entries(theme.component)) {
      lines.push(...toCSSVars(`${comp}`, tokens));
    }
  }
  lines.push("}");
  lines.push("");
}

// Ensure trailing newline for Prettier determinism
writeFileSync("src/styles/generated-themes.css", lines.join("\n") + "\n", "utf8");
console.log("Generated src/styles/generated-themes.css");
