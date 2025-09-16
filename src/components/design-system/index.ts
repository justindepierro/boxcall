/**
 * BoxCall Design System
 *
 * Centralized export for all design system components and utilities
 * Professional design foundation for football management platform
 */

// Typography system
export {
  Typography,
  type TypographyElement,
  type TypographyProps,
  type TypographyVariant,
} from "./Typography";

// Centralized token system
export {
  colorTokens,
  semantic,
  component,
  getComponentColor,
} from "../../design-system/tokens";

// Design system types
export type {
  ColorScale,
  BrandColorTokens,
  SemanticColorTokens,
  ComponentColorTokens,
  TokenUsagePattern,
  TailwindColorClass,
  DesignTokens,
  ValidTokenPath,
} from "../../design-system/types";

// Design system utilities
export {
  getTokenColor,
  tokenClasses,
  isValidToken,
  getAllTokenPaths,
  printTokens,
} from "../../design-system/utils";

// Spacing system
export {
  semanticSpacing,
  spacing,
  spacingClasses,
  spacingUtils,
} from "./Spacing";

// Import utilities for local use
import { colorTokens, semantic, component } from "../../design-system/tokens";

import { semanticSpacing, spacing, spacingUtils } from "./Spacing";

// Design token utilities
export const designTokens = {
  colors: colorTokens,
  semantic,
  component,
  spacing,
  semanticSpacing,
};

// Combined CSS custom properties for all design tokens
export const generateCSSCustomProperties = (): Record<string, string> => {
  return {
    ...spacingUtils.toCSSCustomProperties(),
    // Color tokens are handled via CSS custom properties in /src/styles/tokens.css
  };
};
