import React from "react";
import { Navigation } from "../ui/Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 *
 * Main application layout wrapper that includes navigation
 * and consistent styling for all authenticated pages.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main>{children}</main>
    </div>
  );
};
