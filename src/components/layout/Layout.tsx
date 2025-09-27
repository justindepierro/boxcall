import React, { useMemo, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { useAuthProfile } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../app/store";
import { useNavigate } from "react-router-dom";
import { useActiveTeamStore } from "../../state/activeTeamStore";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types/database";
import {
  getNavigationItems,
  getRoleDisplayInfo,
  toSidebarItems,
} from "../../utils/navigation";
import { Sidebar } from "../ui/Sidebar";
import { DevTools } from "../dev";
import { SidebarLogo } from "../ui/Logo";
import { AppHeader } from "./AppHeader";
import type { DevMode } from "../../types/dev";

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
import { Footer } from "./Footer";
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
  const navigate = useNavigate();
  const { activeTeamId, setActiveTeamId } = useActiveTeamStore();

  // Set active team to user's first team if not already set
  useEffect(() => {
    if (profile?.id && !activeTeamId) {
      console.log("Layout: Setting active team for user", profile.id);
      // Fetch user's teams and set the first one as active
      const fetchUserTeams = async () => {
        try {
          console.log("Layout: Fetching user teams...");
          const { data: memberships, error } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', profile.id)
            .eq('status', 'active')
            .limit(1);
          
          console.log("Layout: Team memberships result:", { memberships, error });
          
          if (error) {
            console.error("Layout: Error fetching team memberships:", error);
            return;
          }
          
          if (memberships && memberships.length > 0) {
            console.log("Layout: Setting active team to", memberships[0].team_id);
            setActiveTeamId(memberships[0].team_id);
          } else {
            console.log("Layout: No team memberships found");
          }
        } catch (error) {
          console.error("Layout: Exception fetching user teams:", error);
        }
      };
      
      fetchUserTeams();
    }
  }, [profile?.id, activeTeamId, setActiveTeamId]);

  // Use profile role, or test role based on dev mode
  const currentRole: UserRole | null =
    devMode !== "production" ? getTestRole(devMode) : (profile?.role ?? null);

  const isDevMode = devMode !== "production";

  // Provide basic navigation items if profile is still loading
  const navigationItems = useMemo(
    () => getNavigationItems(currentRole || "player", activeTeamId), // Pass activeTeamId
    [currentRole, activeTeamId]
  );
  const sidebarItems = useMemo(
    () => toSidebarItems(navigationItems, currentRole, (href: string) => {
      navigate(href);
      // Close sidebar after navigation
      toggleSidebar();
    }),
    [navigationItems, currentRole, navigate, toggleSidebar]
  );
  const roleInfo = useMemo(
    () => getRoleDisplayInfo(currentRole),
    [currentRole]
  );

  // Set data-density attribute on body (once per render cycle)
  if (typeof document !== "undefined") {
    document.body.setAttribute("data-density", uiDensity);
  }
  return (
    <div className="min-h-screen surface-app decorative-gradient bg-[radial-gradient(circle_at_20%_15%,#f5f9f6,#eef3f1)] dark:bg-gradient-to-br dark:from-text-primary dark:via-text-primary dark:to-text-secondary bg-fixed relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' fill=\'none\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>')]" />

      {/* App Header */}
      <AppHeader onMenuToggle={() => toggleSidebar()} />

      {/* Main content area with overlay sidebar and top padding for fixed nav */}
      <div className="relative pt-16">
        {/* Sidebar - Now overlays instead of pushing content */}
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          showOverlay={true}
          header={
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
                    <span className="text-xs bg-surface-warning text-text-warning dark:bg-surface-warning dark:text-text-warning px-1.5 py-0.5 rounded font-medium">
                      DEV
                    </span>
                  )}
                </div>
                {isDevMode && currentRole !== profile?.role && (
                  <p className="text-xs text-text-warning dark:text-text-warning italic">
                    Simulating: {currentRole}
                  </p>
                )}
              </div>
            </div>
          }
          footer={
            <div className="text-xs text-center text-text-secondary">
              <p>BoxCall v0.1.5</p>
              <p>Football Management</p>
              {isDevMode && (
                <p className="text-text-warning dark:text-text-warning font-medium mt-1">
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
        {/* Main content - mobile-first layout */}
        <main className="flex-1 min-h-screen">
          <div className="flex flex-col min-h-screen">
            <div className="flex-1 pb-4">{children}</div>
            <Footer />
          </div>
        </main>

        {/* Professional Development Tools Panel */}
        <DevTools />
      </div>
    </div>
  );
};
