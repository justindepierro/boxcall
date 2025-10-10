#!/usr/bin/env tsx
/**
 * validate-theme-contrast.ts
 * DEPRECATED: This script needs updating to work with the new theme system
 *
 * The legacy theme registry was removed as part of the theme cleanup.
 * This script should be rewritten to validate contrast using the new system:
 * - src/design-system/tokens.ts (source of truth)
 * - src/styles/generated-tokens.css (generated CSS variables)
 * - src/themes/ (light.ts, dark.ts, high-contrast.ts only)
 */

console.warn(
  "⚠️  This script is deprecated and needs to be updated for the new theme system"
);
console.warn("📝 To validate contrast, see: src/design-system/tokens.ts");
process.exit(0);
