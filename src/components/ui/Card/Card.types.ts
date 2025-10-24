/**
 * BoxCall Card Component Types
 * 
 * Shadow-based elevation system (no borders on cards)
 */
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Card Variants - Shadow-only design (NO BORDERS)
 * 
 * Removed: "outlined" variant (violates shadow-only standard)
 * Added: "subtle" and "floating" for expanded elevation range
 */
export type CardVariant =
  | "default"   // Standard card with medium shadow (MOST COMMON)
  | "elevated"  // Stronger shadow for prominent cards
  | "subtle"    // Minimal shadow for secondary content
  | "glass"     // Glassmorphism with backdrop blur
  | "filled"    // Muted background, minimal elevation
  | "accent"    // Brand gradient with shadow
  | "floating"; // Maximum shadow for modals/overlays

export type CardSize =
  | "sm"  // 12px padding - compact
  | "md"  // 16px padding - standard (MOST COMMON)
  | "lg"  // 24px padding - spacious
  | "xl"; // 32px padding - hero sections

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant for styling (shadow-based elevation) */
  variant?: CardVariant;
  /** Card size for padding */
  size?: CardSize;
  /** Card header content */
  header?: ReactNode;
  /** Card footer content */
  footer?: ReactNode;
  /** Whether card is interactive (adds hover effects and lift animation) */
  interactive?: boolean;
  /** Whether card is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the header */
  headerClassName?: string;
  /** Additional CSS classes for the content */
  contentClassName?: string;
  /** Additional CSS classes for the footer */
  footerClassName?: string;
  /** Loading state (shows skeleton) */
  loading?: boolean;
}

export interface CardStylesConfig {
  base: string;
  variants: Record<CardVariant, string>;
  sizes: Record<CardSize, string>;
  interactive: string;
  disabled: string;
  loading: string;
}
