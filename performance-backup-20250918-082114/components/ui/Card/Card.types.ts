/**
 * BoxCall Card Component Types
 */
import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant =
  | "default" // Standard card
  | "elevated" // Card with shadow
  | "outlined" // Card with jade border
  | "filled" // Card with background fill
  | "accent"; // Card with navy accent theme
export type CardSize =
  | "sm" // Small padding
  | "md" // Medium padding (default)
  | "lg" // Large padding
  | "xl"; // Extra large padding
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant for styling */
  variant?: CardVariant;
  /** Card size for padding */
  size?: CardSize;
  /** Card header content */
  header?: ReactNode;
  /** Card footer content */
  footer?: ReactNode;
  /** Whether card is interactive (adds hover effects) */
  interactive?: boolean;
  /** Whether card is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the header */
  headerClassName?: string;
  /** Additional CSS classes for the content */
  contentClassName?: string;
  /** Additional CSS classes for the footer */
  footerClassName?: string;
  /** Loading state */
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
