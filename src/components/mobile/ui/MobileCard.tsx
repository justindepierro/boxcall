import React from "react";
import { Card } from "../../ui/Card";

export interface MobileCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Elevation level */
  elevation?: "none" | "low" | "medium" | "high";
  /** Padding size */
  padding?: "none" | "compact" | "standard" | "spacious";
  /** Whether card is interactive (clickable) */
  interactive?: boolean;
  /** Click handler (if interactive) */
  onTap?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * MobileCard - Base Card Component
 *
 * A flexible card component with configurable elevation,
 * padding, and interactive behavior.
 *
 * @example
 * ```tsx
 * // Simple content card
 * <MobileCard padding="standard">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </MobileCard>
 *
 * // Interactive card
 * <MobileCard
 *   interactive
 *   elevation="medium"
 *   onTap={() => navigate('/details')}
 * >
 *   <CardContent />
 * </MobileCard>
 *
 * // Compact card with custom styling
 * <MobileCard
 *   padding="compact"
 *   elevation="low"
 *   className="bg-gradient-to-r from-blue-50 to-purple-50"
 * >
 *   <MinimalContent />
 * </MobileCard>
 * ```
 *
 * Specifications:
 * - Elevation: none (flat) | low (subtle) | medium (standard) | high (prominent)
 * - Padding: none (0) | compact (12px) | standard (16px) | spacious (24px)
 * - Interactive: Adds hover/active states and cursor pointer
 * - Border radius: 12px (iOS-style rounded)
 */
export function MobileCard({
  children,
  elevation = "low",
  padding = "standard",
  interactive = false,
  onTap,
  className = "",
}: MobileCardProps) {
  const elevationClasses = {
    none: "",
    low: "shadow-sm",
    medium: "shadow-md",
    high: "shadow-lg",
  };

  const paddingClasses = {
    none: "p-0",
    compact: "p-3",
    standard: "p-4",
    spacious: "p-6",
  };

  const interactiveClasses = interactive
    ? "cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all duration-150"
    : "";

  return (
    <Card
      className={`
        ${elevationClasses[elevation]}
        ${paddingClasses[padding]}
        ${interactiveClasses}
        ${className}
      `}
      onClick={onTap}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive && onTap
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTap();
              }
            }
          : undefined
      }
    >
      {children}
    </Card>
  );
}

/**
 * MobileCardHeader - Standard card header component
 */
export interface MobileCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function MobileCardHeader({
  title,
  subtitle,
  action,
  className = "",
}: MobileCardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-3 ${className}`}>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-primary truncate">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted mt-0.5 line-clamp-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * MobileCardFooter - Standard card footer component
 */
export interface MobileCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardFooter({
  children,
  className = "",
}: MobileCardFooterProps) {
  return (
    <div
      className={`
        mt-4 pt-3 
        border-t border-muted
        ${className}
      `}
    >
      {children}
    </div>
  );
}
