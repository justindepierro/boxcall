import { memo, type ReactNode } from "react";

/**
 * GlassCard Component
 *
 * Reusable glassmorphic card with Aurora design system styling.
 * Provides consistent rounded corners, backdrop blur, borders, and shadows.
 *
 * @example
 * ```tsx
 * <GlassCard>
 *   <h2>Card Content</h2>
 * </GlassCard>
 *
 * <GlassCard variant="elevated" padding="lg">
 *   <PlaybookStats />
 * </GlassCard>
 * ```
 */

export interface GlassCardProps {
  /** Card content */
  children: ReactNode;
  /** Visual variant */
  variant?: "default" | "elevated" | "subtle";
  /** Internal padding */
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const variants = {
  default:
    "border-white/70 dark:border-slate-700/60 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.56)] dark:shadow-[0_20px_45px_-20px_rgba(0,0,0,0.75)]",
  elevated:
    "border-white/80 dark:border-slate-700/70 shadow-[0_25px_50px_-20px_rgba(15,23,42,0.7)] dark:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.85)]",
  subtle:
    "border-white/50 dark:border-slate-700/40 shadow-[0_10px_25px_-10px_rgba(15,23,42,0.3)] dark:shadow-[0_10px_25px_-8px_rgba(0,0,0,0.5)]",
} as const;

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
} as const;

/**
 * GlassCard - Aurora Design System Card
 *
 * Provides glassmorphic styling with consistent design tokens.
 * Eliminates duplicate glass effect code across the application.
 */
export const GlassCard = memo<GlassCardProps>(
  ({
    children,
    variant = "default",
    padding = "md",
    className = "",
    onClick,
  }) => {
    const isClickable = !!onClick;

    return (
      <div
        className={`
          rounded-glass-lg
          border 
          bg-white/80 
          dark:bg-slate-900/70 
          backdrop-blur-xl 
          overflow-visible
          ${variants[variant]}
          ${paddings[padding]}
          ${isClickable ? "cursor-pointer hover:shadow-xl transition-shadow duration-200" : ""}
          ${className}
        `}
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
