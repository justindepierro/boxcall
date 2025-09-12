import React from "react";

import { Typography } from "../design-system/Typography";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../app/store";
import { AppHeader } from "./AppHeader";

// Helper to get test role from dev mode
const getTestRole = (devMode: DevMode): UserRole | null => {
  switch (devMode) {
    case "test_as_head_coach":
      return "admin";
    case "test_as_coach":
      return "coach";
    case "test_as_player":
      return "player";
    case "test_as_family":
      return "family";
    default:
      return null;
  }
};
import { getNavigationItems, getRoleDisplayInfo } from "../../utils/navigation";
// import { DevTools } from "../dev";
import { SidebarLogo } from "../ui/Logo";
import { Sidebar } from "../ui/Sidebar/Sidebar";
import { Button } from "../ui/Button";

import { Footer } from "./Footer";

import type { Database } from "../../types/database";
import type { DevMode } from "../../types/dev";

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
  const { devMode } = useDevMode();
  const { sidebarOpen, toggleSidebar, uiDensity } = useUI();

  // Use profile role, or test role based on dev mode
  const currentRole: UserRole | null =
    devMode !== "production" ? getTestRole(devMode) : (profile?.role ?? null);

  const isDevMode = devMode !== "production";

  const navigationItems = getNavigationItems(currentRole);
  const roleInfo = getRoleDisplayInfo(currentRole);

  // Convert navigation items to simple sidebar format
  const sidebarItems = navigationItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    icon: item.icon,
    divider: item.divider,
    badge: item.badge,
  }));

  // Convert navigationItems to NavBarItems format

  // Set data-density attribute on body (once per render cycle)
  if (typeof document !== "undefined") {
    document.body.setAttribute("data-density", uiDensity);
  }
  return (
    <div className="min-h-screen surface-app decorative-gradient bg-[radial-gradient(circle_at_20%_15%,#f5f9f6,#eef3f1)] dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 bg-fixed relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' fill=\'none\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>')]" />

      {/* App Header with auto-hide behavior */}
      <AppHeader onMenuToggle={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Main content area with sidebar overlay and top padding for header */}
      <div className="relative pt-16">
        {/* Simplified Sidebar */}
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <SidebarLogo />
                </div>
                <div>
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-jade-600"
                  >
                    BoxCall
                  </Typography>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-text-secondary">
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
              <Button
                variant="ghost"
                onClick={() => toggleSidebar()}
                className="p-2"
                aria-label="Close sidebar"
              >
                ✕
              </Button>
            </div>
          }
        />

        {/* Main content - mobile-first layout */}
        <main className="flex-1 min-h-screen">
          <div className="flex flex-col min-h-screen">
            <div className="flex-1 pb-4">{children}</div>
            <Footer />
          </div>
        </main>

        {/* Professional Development Tools Panel - Temporarily hidden */}
        {/* <DevTools /> */}
      </div>
    </div>
  );
};
