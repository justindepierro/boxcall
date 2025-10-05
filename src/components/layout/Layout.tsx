import React, { useMemo, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { useAuthProfile, useAuthProfileLoading } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../app/store";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Footer } from "./Footer";
import type { DevMode } from "../../types/dev";
import { emitTelemetry } from "../../lib/telemetry";
import { colorTokens } from "../../design-system/tokens";

const SUPER_ADMIN_EMAIL = "justindepierro@gmail.com";

type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
type ExtendedUserRole = UserRole | "super_admin";

// Helper to get test role from dev mode
const getTestRole = (devMode: DevMode): ExtendedUserRole | null => {
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
  const profileLoading = useAuthProfileLoading();
  console.log("👤 Profile:", profile);
  const { devMode } = useDevMode();
  const { sidebarOpen, toggleSidebar, uiDensity } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTeamId, setActiveTeamId } = useActiveTeamStore();

  // Set active team to user's first team if not already set
  useEffect(() => {
    if (profile?.id && !activeTeamId) {
      // Fetch user's teams and set the first one as active
      const fetchUserTeams = async () => {
        try {
          const { data: memberships } = await supabase
            .from("team_members")
            .select("team_id")
            .eq("user_id", profile.id)
            .eq("status", "active")
            .limit(1);

          if (memberships && memberships.length > 0) {
            setActiveTeamId(memberships[0].team_id);
          }
        } catch (error) {
          console.error("Error fetching user teams:", error);
        }
      };

      fetchUserTeams();
    }
  }, [profile?.id, activeTeamId, setActiveTeamId]);

  // Determine effective app role with dev-mode + super admin override
  const baseRole: ExtendedUserRole | null = profile?.role ?? null;
  const simulatedRole =
    devMode !== "production" ? getTestRole(devMode) : baseRole;
  const currentRole: ExtendedUserRole | null =
    profile?.email === SUPER_ADMIN_EMAIL ? "super_admin" : simulatedRole;

  const isDevMode = devMode !== "production";

  // Provide basic navigation items if profile is still loading
  const navigationItems = useMemo(
    () => getNavigationItems(currentRole || "player", activeTeamId), // Pass activeTeamId
    [currentRole, activeTeamId]
  );
  const sidebarItems = useMemo(
    () =>
      toSidebarItems(navigationItems, currentRole, (href: string) => {
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

  const navigationLoading = profileLoading && !profile;

  useEffect(() => {
    emitTelemetry("navigation.view", { path: location.pathname });
  }, [location.pathname]);

  // Set data-density attribute on body (once per render cycle)
  if (typeof document !== "undefined") {
    document.body.setAttribute("data-density", uiDensity);
  }
  return (
    <div className="min-h-screen surface-app decorative-gradient bg-[radial-gradient(circle_at_20%_15%,colorTokens.jade[50],colorTokens.emerald[50])] dark:bg-gradient-to-br dark:from-text-primary dark:via-text-primary dark:to-text-secondary bg-fixed relative before:pointer-events-none before:absolute before:inset-0 before:opacity-[0.03] before:bg-[url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' fill=\'none\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>')]">
      {/* App Header */}
      <AppHeader onMenuToggle={() => toggleSidebar()} />

      {/* Main content area with overlay sidebar and top padding for fixed nav */}
      <div className="pt-16">
        {/* Sidebar - Now overlays instead of pushing content */}
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          showOverlay={true}
          loading={navigationLoading && sidebarItems.length === 0}
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
        {/* Main content with footer */}
        <main className="flex flex-col min-h-screen">
          <div className="flex-1 pb-4">{children}</div>
          <Footer />
        </main>

        {/* Professional Development Tools Panel */}
        <DevTools />
      </div>
    </div>
  );
};
