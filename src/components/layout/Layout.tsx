import React from "react";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../app/store";
import type { Database } from "../../types/database";
import {
  getNavigationItems,
  getRoleDisplayInfo,
  toSidebarItems,
} from "../../utils/navigation";
import { Navigation } from "../ui/Navigation";
import { Sidebar } from "../ui/Sidebar";
import { QuickDevPanel } from "../dev/QuickDevPanel";
type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
interface LayoutProps {
  children: React.ReactNode;
}
/**
 * Layout Component
 *
 * Main application layout wrapper with integrated navigation and sidebar.
 * Provides consistent layout structure for all authenticated pages.
 * Supports dev mode role switching for testing different user experiences.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const profile = useAuthProfile();
  const { effectiveUserRole, devMode, isDevMode } = useDevMode();
  const { sidebarOpen, toggleSidebar } = useUI();
  // Use effective role from dev mode if in dev mode, otherwise use profile role
  // Cast effectiveUserRole to UserRole since we control the dev mode values
  const currentRole: UserRole | null = isDevMode
    ? (effectiveUserRole as UserRole)
    : (profile?.role ?? null);
  const navigationItems = getNavigationItems(currentRole);
  const sidebarItems = toSidebarItems(navigationItems, currentRole);
  const roleInfo = getRoleDisplayInfo(currentRole);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      {/* Main content area with overlay sidebar */}
      <div className="relative">
        {/* Sidebar - Now overlays instead of pushing content */}
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          showOverlay={true}
          header={
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/boxcall-logo.svg"
                  alt="BoxCall"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-jade-600">
                  BoxCall
                </h3>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {roleInfo.display}
                  </p>
                  {isDevMode && (
                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-medium">
                      DEV
                    </span>
                  )}
                </div>
                {isDevMode && currentRole !== profile?.role && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    Simulating: {currentRole}
                  </p>
                )}
              </div>
            </div>
          }
          footer={
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>BoxCall v0.1.5</p>
              <p>Football Management</p>
              {isDevMode && (
                <p className="text-amber-600 dark:text-amber-400 font-medium mt-1">
                  Dev Mode:{" "}
                  {devMode
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              )}
            </div>
          }
          width="md"
          position="left"
        />
        {/* Main content - always full width, no margin shifts */}
        <main className="w-full">{children}</main>

        {/* Development Tools Panel */}
        <QuickDevPanel />
      </div>
    </div>
  );
};
