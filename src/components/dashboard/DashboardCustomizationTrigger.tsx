import React from "react";
import { Button } from "../ui";
import { Icon } from "../ui/Icon";

/**
 * Dashboard Customization Trigger
 * Phase 2A: Smart Dashboard Personalization
 *
 * Floating action button that opens the dashboard customization panel.
 * Positioned strategically for easy access without interfering with content.
 */

interface DashboardCustomizationTriggerProps {
  onClick: () => void;
  className?: string;
}

export const DashboardCustomizationTrigger: React.FC<
  DashboardCustomizationTriggerProps
> = ({ onClick, className = "" }) => {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 p-0 
                  transition-colors duration-200 lg:bottom-8 lg:right-8
                  ${className}`}
      aria-label="Customize dashboard layout"
      title="Customize Dashboard"
    >
      <Icon name="settings" size="lg" className="text-text-inverse" />
    </Button>
  );
};
