import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type { IconName } from "../ui/Icon/Icon";

export interface QuickAction {
  id: string;
  label: string;
  icon: IconName;
  to: string;
  color?: string;
  bgColor?: string;
}

export interface MobileQuickActionGridProps {
  actions?: QuickAction[];
  onActionClick?: (actionId: string) => void;
}

/**
 * MobileQuickActionGrid - Thumb-reachable action shortcuts for Dashboard
 *
 * Replaces Aurora tile actions on mobile with 2×2 grid of large touch targets.
 * Positioned within 300px of top for easy thumb reach.
 *
 * Design:
 * - Grid: 2×2 (4 buttons)
 * - Touch target: 80px × 80px (exceeds 44px minimum)
 * - Gap: 12px
 * - Total height: 172px
 *
 * Default Actions:
 * 1. New Play → /playbook?action=new
 * 2. Schedule → /calendar
 * 3. Roster → /roster
 * 4. Playbook → /playbook
 *
 * Responsive:
 * - Mobile (<768px): 2×2 grid
 * - Tablet (768-1023px): 1×4 horizontal
 * - Desktop (≥1024px): Hidden (Aurora tiles used)
 */
export const MobileQuickActionGrid: React.FC<MobileQuickActionGridProps> = ({
  actions: customActions,
  onActionClick,
}) => {
  const navigate = useNavigate();

  // Default actions if none provided
  const defaultActions: QuickAction[] = [
    {
      id: "new-play",
      label: "New Play",
      icon: "plus",
      to: "/playbook?action=new",
      color: "text-brand-primary",
      bgColor: "bg-brand-primary/10",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: "calendar",
      to: "/calendar",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      id: "roster",
      label: "Roster",
      icon: "users",
      to: "/roster",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      id: "playbook",
      label: "Playbook",
      icon: "book",
      to: "/playbook",
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const actions = customActions || defaultActions;

  const handleActionClick = (action: QuickAction) => {
    // Track click if callback provided
    if (onActionClick) {
      onActionClick(action.id);
    }

    // Navigate to action destination
    navigate(action.to);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <Typography
        variant="headline-sm"
        className="text-text-primary font-semibold px-1"
      >
        Quick Actions
      </Typography>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`
              ${action.bgColor || "bg-surface-secondary"}
              rounded-xl p-4 
              min-h-20
              flex flex-col items-center justify-center gap-2
              border border-border
              hover:scale-105 active:scale-95
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
            `}
            aria-label={action.label}
          >
            {/* Icon */}
            <Icon
              name={action.icon}
              className={`w-6 h-6 ${action.color || "text-text-primary"}`}
            />

            {/* Label */}
            <Typography
              variant="body-sm"
              className={`${action.color || "text-text-primary"} font-medium text-center`}
            >
              {action.label}
            </Typography>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActionGrid;
