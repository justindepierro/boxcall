import React from "react";
import { Icon } from "../ui/Icon";
import type { IconName } from "../ui/Icon/Icon";
import { Badge } from "../ui/Badge";

export interface QuickAction {
  /** Unique identifier */
  id: string;
  /** Icon name */
  icon: IconName;
  /** Action label */
  label: string;
  /** Optional badge count */
  badge?: number;
  /** Visual variant */
  variant?: "default" | "primary" | "secondary";
  /** Click handler */
  onTap: () => void;
}

export interface MobileQuickActionsProps {
  /** Array of quick action items */
  actions: QuickAction[];
  /** Optional class name */
  className?: string;
}

/**
 * MobileQuickActions - Icon Button Grid
 *
 * Displays 2-4 quick action buttons in a responsive grid.
 * Each action has an icon, label, and optional badge.
 *
 * @example
 * ```tsx
 * <MobileQuickActions
 *   actions={[
 *     {
 *       id: 'new',
 *       icon: 'plus',
 *       label: 'New Play',
 *       variant: 'primary',
 *       onTap: () => navigate('/playbook/new')
 *     },
 *     {
 *       id: 'practice',
 *       icon: 'clock',
 *       label: 'Practice',
 *       badge: 3,
 *       onTap: () => navigate('/practice')
 *     },
 *     {
 *       id: 'gameplan',
 *       icon: 'flag',
 *       label: 'Game Plan',
 *       onTap: () => navigate('/gameplan')
 *     }
 *   ]}
 * />
 * ```
 *
 * Specifications:
 * - Touch target: 56px × 56px minimum (icon button)
 * - Label: 14px, centered below icon
 * - Badge: Top-right corner, red dot or number
 * - Grid: 2-4 items, auto-adjusts spacing
 * - Animation: Scale down on tap
 */
export function MobileQuickActions({
  actions,
  className = "",
}: MobileQuickActionsProps) {
  return (
    <div
      className={`
        grid gap-3 px-4
        ${actions.length === 2 ? "grid-cols-2" : ""}
        ${actions.length === 3 ? "grid-cols-3" : ""}
        ${actions.length === 4 ? "grid-cols-2 sm:grid-cols-4" : ""}
        ${actions.length > 4 ? "grid-cols-2 sm:grid-cols-4" : ""}
        ${className}
      `}
    >
      {actions.map((action) => (
        <QuickActionButton key={action.id} {...action} />
      ))}
    </div>
  );
}

/**
 * QuickActionButton - Individual Quick Action Button
 */
function QuickActionButton({
  icon,
  label,
  badge,
  variant = "default",
  onTap,
}: QuickAction) {
  const variantStyles = {
    default: "bg-surface-secondary hover:bg-surface-subtle",
    primary: "bg-brand-primary/10 hover:bg-brand-primary/20",
    secondary: "bg-surface-secondary hover:bg-surface-subtle",
  };

  const iconColorStyles = {
    default: "text-primary",
    primary: "text-brand-primary",
    secondary: "text-secondary",
  };

  return (
    <button
      onClick={onTap}
      className={`
        relative
        flex flex-col items-center justify-center gap-2
        p-4 rounded-xl
        min-h-24
        transition-all duration-150
        active:scale-95
        ${variantStyles[variant]}
      `}
    >
      {/* Icon Container */}
      <div
        className={`
          w-14 h-14 rounded-full
          flex items-center justify-center
          ${variant === "primary" ? "bg-brand-primary/20" : "bg-surface-base"}
        `}
      >
        <Icon name={icon} size="lg" className={iconColorStyles[variant]} />
      </div>

      {/* Label */}
      <span className="text-sm font-medium text-primary text-center line-clamp-1">
        {label}
      </span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <div className="absolute top-2 right-2">
          <Badge variant="danger" size="sm">
            {badge > 99 ? "99+" : badge}
          </Badge>
        </div>
      )}
    </button>
  );
}

/**
 * Alternative: Simple Quick Action Row (no grid, horizontal scroll)
 */
export interface MobileQuickActionRowProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileQuickActionRow({
  children,
  className = "",
}: MobileQuickActionRowProps) {
  return (
    <div
      className={`
        flex gap-3 px-4 
        overflow-x-auto scrollbar-hide
        snap-x snap-mandatory
        ${className}
      `}
    >
      {children}
    </div>
  );
}
