import React, { useState } from "react";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";

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

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="mb-4 space-y-2">
          {actions.map((action) => (
            <div key={action.id} className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                variant={action.variant || "secondary"}
                size="sm"
                className="transition-colors duration-200 min-w-40 justify-start"
                title={
                  action.shortcut
                    ? `${action.label} (${action.shortcut})`
                    : action.label
                }
              >
                <Icon name={action.icon as any} className="h-4 w-4 mr-2" />
                {action.label}
                {action.shortcut && (
                  <span className="ml-auto text-xs opacity-70">
                    {action.shortcut}
                  </span>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="primary"
        size="lg"
        className="rounded-full w-14 h-14 transition-colors duration-200"
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
