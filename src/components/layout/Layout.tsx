import React, { useMemo, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { useAuthProfile, useAuthProfileLoading } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../stores/uiStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import type { Database } from "../../types/database";
import { getNavigationItems, toSidebarItems } from "../../utils/navigation";
import { Sidebar } from "../ui/Sidebar";
import { SidebarLogo } from "../ui/Logo";
import { AppHeader } from "./AppHeader";
// import { OfflineBanner } from '../ui/OfflineBanner/OfflineBanner';
import { Footer } from "./Footer";
import { UnifiedSettingsPanel } from "../../features/dashboard";
import type { DevMode } from "../../types/dev";
import { emitTelemetry } from "../../lib/telemetry";
import { isSuperAdminEmail } from "../../config/superAdmin";
import { debug, warn, error as logError } from "../../utils/logger";
import { withDatabaseRetry } from "../../lib/database-helpers";
import { supabase } from "../../lib/supabase";

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
  const { devMode } = useDevMode();
  const { sidebarOpen, toggleSidebar, uiDensity } = useUI();
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTeamId, setActiveTeamId } = useActiveTeamStore();

  // Set active team to user's first team if not already set
  useEffect(() => {
    debug("[Layout] Team sync effect:", {
      profileId: profile?.id,
      activeTeamId,
    });
    if (!profile?.id) {
      debug("[Layout] No profile ID, skipping team sync");
      return;
    }
    if (activeTeamId) {
      debug("[Layout] Already have activeTeamId:", activeTeamId);
      return;
    }

    // Fetch user's teams and set the first one as active
    const fetchUserTeams = async () => {
      debug("[Layout] Fetching teams for user:", profile.id);
      try {
        const teamId = await withDatabaseRetry(
          async () => {
            const { data, error } = await supabase
              .from("team_members")
              .select("team_id")
              .eq("user_id", profile.id)
              .eq("status", "active")
              .limit(1)
              .maybeSingle();

            if (error) {
              throw new Error(error.message);
            }

            return data?.team_id ?? null;
          },
          { timeout: 10000 }
        );

        if (teamId) {
          debug("[Layout] Setting active team to:", teamId);
          setActiveTeamId(teamId);
        } else {
          warn("[Layout] No team memberships found for user");
          debug(
            "[Layout] No team memberships found for user (expected in dev)"
          );
        }
      } catch (err) {
        logError("[Layout] Exception fetching user teams:", err);
      }
    };

    fetchUserTeams();
  }, [profile?.id, activeTeamId, setActiveTeamId]);

  // Determine effective app role with dev-mode + super admin override
  const baseRole: ExtendedUserRole | null = profile?.role ?? null;
  const simulatedRole =
    devMode !== "production" ? getTestRole(devMode) : baseRole;
  const currentRole: ExtendedUserRole | null = isSuperAdminEmail(
    profile?.email ?? null
  )
    ? "super_admin"
    : simulatedRole;

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

  const navigationLoading = profileLoading && !profile;

  useEffect(() => {
    emitTelemetry("navigation.view", { path: location.pathname });
  }, [location.pathname]);

  // Set data-density attribute on body (once per render cycle)
  if (typeof document !== "undefined") {
    document.body.setAttribute("data-density", uiDensity);
  }
  return (
    <div className="relative min-h-screen surface-app bg-surface-base text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-aurora-radial opacity-25 transition-opacity duration-500 dark:opacity-15"
      />
      {/* App Header */}
      <AppHeader
        onMenuToggle={() => toggleSidebar()}
        onVisibilityChange={setHeaderVisible}
      />

      {/* Main content area with overlay sidebar and top padding for fixed nav */}
      <div className="relative z-dropdown pt-16">
        {/* Sidebar - Now overlays instead of pushing content */}
        <Sidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar()}
          onToggle={() => toggleSidebar()}
          showOverlay={true}
          loading={navigationLoading && sidebarItems.length === 0}
          headerVisible={headerVisible}
          header={
            <div className="flex items-center gap-3 py-1">
              <div className="flex-shrink-0">
                <SidebarLogo />
              </div>
              <div className="min-w-0 flex-1">
                <Typography
                  variant="headline-sm"
                  className="text-jade-600 dark:text-jade-400 font-bold tracking-tight leading-tight whitespace-nowrap"
                >
                  BoxCall
                </Typography>
                <div className="flex items-center gap-1.5 text-xs leading-tight">
                  <span className="text-secondary truncate">
                    {(() => {
                      if (isSuperAdminEmail(profile?.email ?? null))
                        return "Super Admin";
                      if (profile?.role === "coach") return "Coach";
                      if (profile?.role === "player") return "Player";
                      return "User";
                    })()}
                  </span>
                  {devMode && devMode !== "production" && (
                    <span className="text-warning-600 dark:text-warning-400 font-medium">
                      DEV
                    </span>
                  )}
                </div>
              </div>
            </div>
          }
          footer={
            <div className="text-xs text-center text-secondary">
              <p>BoxCall v0.1.5</p>
              <p>Football Management</p>
              {isDevMode && (
                <p className="text-warning dark:text-warning font-medium mt-1">
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

        {/* Canonical floating/settings/dev surface (dashboard only) */}
        {location.pathname === "/dashboard" ||
        location.pathname.startsWith("/dashboard/") ||
        location.pathname === "/player-dashboard" ? (
          <UnifiedSettingsPanel />
        ) : null}
      </div>
    </div>
  );
};
