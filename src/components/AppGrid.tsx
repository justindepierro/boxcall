import React from "react";
import { useBreakpoint } from "../hooks/useBreakpoint";

interface AppGridProps {
  children: React.ReactNode;
}

/**
 * AppGrid - Universal responsive layout wrapper for all pages
 * Ensures consistent spacing, breakpoints, and max width
 * Usage: Wrap all page content in <AppGrid>...</AppGrid>
 */
export const AppGrid: React.FC<AppGridProps> = ({ children }) => {
  const breakpoint = useBreakpoint();
  return (
    <div
      className="min-h-screen w-full container-page container-padding"
      data-breakpoint={breakpoint}
    >
      {children}
    </div>
  );
};
