/**
 * Design Token Types
 * TypeScript definitions for the centralized design system
 */

// Color scale type for consistent token structure
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

// Brand color tokens
export type BrandColorTokens = {
  jade: ColorScale;
  navy: ColorScale;
  success: {
    50: string;
    500: string;
    600: string;
  };
  warning: {
    50: string;
    500: string;
    600: string;
  };
  error: {
    50: string;
    500: string;
    600: string;
  };
  gray: ColorScale;
};

// Semantic color usage
export type SemanticColorTokens = {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  success: string;
  warning: string;
  error: string;
};

// Component-specific tokens
export type ComponentColorTokens = {
  button: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
  };
  card: {
    background: string;
    border: string;
    shadow: string;
  };
  icon: {
    jade: string;
    navy: string;
    muted: string;
  };
  nav: {
    brand: string;
    text: string;
    textHover: string;
    background: string;
    backgroundHover: string;
  };
};

// Design token usage patterns
export type TokenUsagePattern =
  | "brand-jade"
  | "interaction-jade"
  | "surface-jade"
  | "brand-navy"
  | "brand-navy-dark"
  | "surface-jade-dark"
  | "brand-jade-dark"
  | "brand-jade-light";

// Utility type for Tailwind class generation
export type TailwindColorClass<T extends string> =
  | `bg-${T}`
  | `text-${T}`
  | `border-${T}`
  | `hover:bg-${T}`
  | `hover:text-${T}`
  | `hover:border-${T}`
  | `focus:bg-${T}`
  | `focus:text-${T}`
  | `focus:border-${T}`;

// Complete design token system type
export interface DesignTokens {
  colors: BrandColorTokens;
  semantic: SemanticColorTokens;
  component: ComponentColorTokens;
}

// Token validation helper
export type ValidTokenPath =
  | keyof BrandColorTokens
  | keyof SemanticColorTokens
  | keyof ComponentColorTokens;
