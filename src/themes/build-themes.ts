#!/usr/bin/env ts-node
/**
 * Build theme CSS blocks from registry.
 * Writes: src/styles/generated-themes.css
 */
import { writeFileSync } from "fs";
import { themeRegistry } from "./registry";

function toCSSVars(prefix: string, obj: Record<string, string>): string[] {
  return Object.entries(obj).map(
    ([k, v]) =>
      `  --${prefix}-${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v};`
  );
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

writeFileSync("src/styles/generated-themes.css", lines.join("\n"), "utf8");
console.log("Generated src/styles/generated-themes.css");
