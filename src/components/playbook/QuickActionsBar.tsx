import React, { useState } from "react";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  shortcut?: string;
  variant?: "primary" | "secondary";
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  actions,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const toggleExpanded = () => {
    if (isMobile) {
      triggerHapticFeedback("light");
    }
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: QuickAction) => {
    if (isMobile) {
      triggerHapticFeedback("light");
    }
    action.onClick();
    setIsExpanded(false);
  };

  return (
    <div className={`fixed ${isMobile ? "bottom-20 right-4" : "bottom-6 right-6"} z-40 ${className}`}>
      {/* Backdrop - Only on mobile when expanded */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1] animate-in fade-in-0 duration-200"
          onClick={toggleExpanded}
        />
      )}

      {/* Expanded Actions */}
      {isExpanded && (
        <div className={`mb-4 space-y-${isMobile ? "3" : "2"}`}>
          {actions.map((action) => (
            <div key={action.id} className="flex items-center justify-end gap-3">
              {/* Mobile: Show label outside button */}
              {isMobile && (
                <span className="text-sm font-medium text-text-primary px-3 py-2 bg-surface-card rounded-lg shadow-md">
                  {action.label}
                </span>
              )}
              
              <Button
                onClick={() => handleActionClick(action)}
                variant={action.variant || "secondary"}
                size={isMobile ? "lg" : "sm"}
                className={`transition-all duration-200 ${
                  isMobile
                    ? "min-w-12 h-12 rounded-full shadow-lg active:scale-95"
                    : "min-w-40 justify-start"
                }`}
                title={
                  action.shortcut
                    ? `${action.label} (${action.shortcut})`
                    : action.label
                }
              >
                <Icon
                  name={action.icon as any}
                  className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"}
                />
                {/* Desktop: Show label inside button */}
                {!isMobile && (
                  <>
                    {action.label}
                    {action.shortcut && (
                      <span className="ml-auto text-xs opacity-70">
                        {action.shortcut}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button - Larger on mobile (56px) */}
      <Button
        onClick={toggleExpanded}
        variant="primary"
        size="lg"
        className={`rounded-full transition-all duration-200 shadow-xl active:scale-95 ${
          isMobile ? "w-14 h-14" : "w-14 h-14"
        } ${isExpanded ? "rotate-45" : ""}`}
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
