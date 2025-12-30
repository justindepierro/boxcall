import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/Button/Button";
import { Icon, type IconName } from "../ui/Icon";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

interface QuickAction {
  id: string;
  label: string;
  icon: IconName;
  onClick: () => void;
  shortcut?: string;
  variant?: "primary" | "secondary";
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  className?: string;
}

/**
 * QuickActionsBar - Floating action button with expandable actions
 *
 * Mobile-first design:
 * - Mobile: Bottom-right FAB with circular action buttons, labels outside
 * - Desktop: Bottom-right with labeled buttons, no backdrop
 */
export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  actions,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Close on Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleExpanded = () => {
    triggerHapticFeedback("light");
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: QuickAction) => {
    triggerHapticFeedback("light");
    action.onClick();
    setIsExpanded(false);
  };

  return (
    <div
      className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-fixed ${className}`}
    >
      {/* Backdrop - Only visible on mobile when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1] animate-in fade-in-0 duration-200 md:hidden"
          onClick={toggleExpanded}
        />
      )}

      {/* Expanded Actions */}
      {isExpanded && (
        <div
          id="quick-actions-menu"
          role="menu"
          aria-label="Quick actions"
          className="mb-4 space-y-3 md:space-y-2"
        >
          {actions.map((action) => (
            <div
              key={action.id}
              role="none"
              className="flex items-center justify-end gap-3"
            >
              {/* Mobile: Show label outside button */}
              <span
                aria-hidden="true"
                className="text-sm font-medium text-primary px-3 py-2 bg-primary rounded-lg shadow-md md:hidden"
              >
                {action.label}
              </span>

              <Button
                onClick={() => handleActionClick(action)}
                variant={action.variant || "secondary"}
                size="lg"
                role="menuitem"
                aria-label={action.label}
                className={`transition-all duration-200
                  min-w-12 h-12 rounded-full shadow-lg active:scale-95
                  md:min-w-40 md:h-auto md:rounded-lg md:shadow-md md:justify-start`}
                title={
                  action.shortcut
                    ? `${action.label} (${action.shortcut})`
                    : action.label
                }
              >
                <Icon
                  name={action.icon}
                  className="h-5 w-5 md:h-4 md:w-4 md:mr-2"
                />
                {/* Desktop: Show label inside button */}
                <span className="hidden md:inline">
                  {action.label}
                  {action.shortcut && (
                    <span className="ml-auto text-xs opacity-70">
                      {action.shortcut}
                    </span>
                  )}
                </span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        onClick={toggleExpanded}
        variant="primary"
        size="lg"
        className={`w-14 h-14 rounded-full transition-all duration-200 shadow-xl active:scale-95 ${
          isExpanded ? "rotate-45" : ""
        }`}
        aria-label={isExpanded ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isExpanded}
        aria-controls="quick-actions-menu"
        title={isExpanded ? "Close quick actions" : "Quick actions"}
      >
        <Icon
          name={isExpanded ? "close" : "plus"}
          className="h-6 w-6 transition-transform duration-200"
        />
      </Button>
    </div>
  );
};
