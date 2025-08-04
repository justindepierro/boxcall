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
// Color system
export { colorClasses, colors, colorUtils, semanticColors } from "./Colors";
// Spacing system
export {
  semanticSpacing,
  spacing,
  spacingClasses,
  spacingUtils,
} from "./Spacing";
// Import utilities for local use
import { colors, colorUtils, semanticColors } from "./Colors";
import { semanticSpacing, spacing, spacingUtils } from "./Spacing";
// Design token utilities
export const designTokens = {
  colors,
  spacing,
  semanticColors,
  semanticSpacing,
};
// Combined CSS custom properties for all design tokens
export const generateCSSCustomProperties = (): Record<string, string> => {
  return {
    ...colorUtils.toCSSCustomProperties(),
    ...spacingUtils.toCSSCustomProperties(),
  };
};
