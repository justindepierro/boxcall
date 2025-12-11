import React, { useMemo, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { useAuthProfile, useAuthProfileLoading } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import { useUI } from "../../app/store";
import { useNavigate, useLocation } from "react-router-dom";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import type { Database } from "../../types/database";
import { getNavigationItems, toSidebarItems } from "../../utils/navigation";
import { Sidebar } from "../ui/Sidebar";
import { DevTools } from "../dev";
import { SidebarLogo } from "../ui/Logo";
import { AppHeader } from "./AppHeader";
// import { OfflineBanner } from '../ui/OfflineBanner/OfflineBanner';
import { Footer } from "./Footer";
import type { DevMode } from "../../types/dev";
import { emitTelemetry } from "../../lib/telemetry";
import { isSuperAdminEmail } from "../../config/superAdmin";
import { debug, error as logError } from "../../utils/logger";

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
    console.log("🏈 [Layout] Team sync effect:", {
      profileId: profile?.id,
      activeTeamId,
    });
    if (!profile?.id) {
      console.log("🏈 [Layout] No profile ID, skipping team sync");
      return;
    }
    if (activeTeamId) {
      console.log("🏈 [Layout] Already have activeTeamId:", activeTeamId);
      return;
    }

    // Fetch user's teams and set the first one as active
    const fetchUserTeams = async () => {
      console.log("🏈 [Layout] Fetching teams for user:", profile.id);
      debug("[Layout] Fetching teams for user:", profile.id);

      // WORKAROUND: Supabase client queries hang in browser
      // Use direct fetch with stored auth token instead
      try {
        const startTime = Date.now();

        // Get the stored session token
        const storedAuth = localStorage.getItem("boxcall-auth");
        let accessToken = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (storedAuth) {
          try {
            const parsed = JSON.parse(storedAuth);
            console.log(
              "🏈 [Layout] Found stored auth, has access_token:",
              !!parsed?.access_token
            );
            if (parsed?.access_token) {
              accessToken = parsed.access_token;
            }
          } catch {
            // Use anon key
          }
        } else {
          console.log("🏈 [Layout] No stored auth found in localStorage");
        }

        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/team_members?user_id=eq.${profile.id}&status=eq.active&select=team_id&limit=1`;
        console.log("🏈 [Layout] Fetching:", url);

        const response = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const elapsed = Date.now() - startTime;
        console.log(
          `🏈 [Layout] Fetch took ${elapsed}ms, status: ${response.status}`
        );
        debug(`[Layout] Fetch took ${elapsed}ms, status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "🏈 [Layout] Fetch failed:",
            response.status,
            errorText
          );
          logError("[Layout] Fetch failed:", response.status, errorText);
          return;
        }

        const memberships = await response.json();
        console.log("🏈 [Layout] Memberships response:", memberships);

        if (memberships && memberships.length > 0) {
          console.log(
            "🏈 [Layout] Setting active team to:",
            memberships[0].team_id
          );
          debug("[Layout] Setting active team to:", memberships[0].team_id);
          setActiveTeamId(memberships[0].team_id);
        } else {
          console.warn(
            "🏈 [Layout] No team memberships found for user - USER IS NOT IN team_members TABLE"
          );
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
                    {isSuperAdminEmail(profile?.email ?? null)
                      ? "Super Admin"
                      : profile?.role === "coach"
                        ? "Coach"
                        : profile?.role === "player"
                          ? "Player"
                          : "User"}
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

        {/* Professional Development Tools Panel */}
        <DevTools />
      </div>
    </div>
  );
};
