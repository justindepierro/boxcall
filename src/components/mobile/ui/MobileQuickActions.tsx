import React from "react";
import { motion } from "framer-motion";
import { Icon } from "../../ui/Icon";
import type { IconName } from "../../ui/Icon/Icon";
import { Badge } from "../../ui/Badge";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

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
        grid gap-3 px-4 overflow-visible
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
    default: "bg-secondary hover:bg-subtle",
    primary:
      "bg-gradient-to-br from-brand-jade/10 to-emerald-500/10 hover:from-brand-jade/20 hover:to-emerald-500/20",
    secondary: "bg-secondary hover:bg-subtle",
  };

  const iconColorStyles = {
    default: "text-primary",
    primary: "text-brand-jade",
    secondary: "text-secondary",
  };

  const iconContainerStyles = {
    default: "bg-surface-base",
    primary:
      "bg-gradient-to-br from-brand-jade to-emerald-500 shadow-lg shadow-jade-500/25",
    secondary: "bg-surface-base",
  };

  const handleTap = () => {
    triggerHapticFeedback("light");
    onTap();
  };

  return (
    <motion.button
      onClick={handleTap}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      className={`
        relative
        flex flex-col items-center justify-center gap-1.5
        p-3 rounded-xl
        min-h-20
        transition-all duration-200
        overflow-visible
        ${variantStyles[variant]}
      `}
    >
      {/* Icon Container */}
      <motion.div
        whileHover={
          variant === "primary" ? { rotate: [0, -10, 10, -10, 0] } : {}
        }
        transition={{ duration: 0.5 }}
        className={`
          w-12 h-12 rounded-full
          flex items-center justify-center
          ${iconContainerStyles[variant]}
        `}
      >
        <Icon
          name={icon}
          className={`w-5 h-5 ${variant === "primary" ? "text-white" : iconColorStyles[variant]}`}
        />
      </motion.div>

      {/* Label */}
      <span className="text-xs font-semibold text-primary text-center line-clamp-1">
        {label}
      </span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 15,
          }}
          className="absolute top-2.5 right-2.5"
        >
          <Badge variant="danger" size="sm">
            {badge > 99 ? "99+" : badge}
          </Badge>
        </motion.div>
      )}
    </motion.button>
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
