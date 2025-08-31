import React from "react";

interface DashboardGridProps {
  children: React.ReactNode;
}

/**
 * DashboardGrid - Centralized responsive grid system for dashboard pages
 * Usage: Wrap dashboard content in <DashboardGrid>...</DashboardGrid>
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => (
  <section
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full"
    aria-label="Dashboard panels"
  >
    {children}
  </section>
);
