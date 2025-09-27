import React, { Suspense, useMemo, useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { AuthProvider } from "../components/auth";
import { useAuth } from "../app/auth-store";
import { useActiveTeamStore } from "../state/activeTeamStore";
import {
  LazyDashboardPage,
  LazyLoginPage,
  LazyTeamBulletin,
  LazyAnalyticsPage,
  LazyBoxCall,
  LazyPlaybookPage,
  LazyPracticePlansPage,
  LazyGamePlansPage,
  LazyProfilePage,
  LazyTeamsPage,
  LazyCoachManagementPage,
  LazyPlayerDashboardPage,
  LazyAchievementAdminPage,
  LazyCreateTeam,
  LazyJoinTeam,
  LazyCreateCoachAccount,
  LazyAboutPage,
  LazyPrivacyPolicyPage,
  LazyTermsOfServicePage,
  LazyContactPage,
  LazyCollaborativeDemoPage,
  LazyDesignSystemShowcase,
  LazySocialFeaturesDemo,
  LazyCalendarShellPage,
  LazyPlannerPage,
  RouteLoadingSpinner,
} from "../components/lazy/LazyRoutes";
import ScrollToTop from "./ScrollToTop";
import { TeamParamSync } from "./TeamParamSync";
import { Layout } from "../components/layout/Layout";
import { DashboardProvider } from "../contexts/DashboardContext";
import { RoleProvider } from "../hooks/useRoles";
import { PlaybookProvider } from "../contexts/PlaybookContext";
import { ROUTES } from "./paths";
import {
  requireTeamAnalyticsLoader,
  requireAuthenticatedLoader,
  requireTeamMemberLoader,
  requireCoachOrAdminLoader,
  requireRolesLoader,
} from "./loaderAuth";
import RouteErrorElement from "./RouteErrorElement";

// Root wrapper so loaders run pre-render and providers are applied once
const RootLayout: React.FC = () => (
  <>
    <ScrollToTop />
    <TeamParamSync />
    <Outlet />
  </>
);

// App shell that provides NavBar + Sidebar around routed pages
const AppShell: React.FC = () => (
  <DashboardProvider>
    <RoleProvider>
      <Layout>
        <Outlet />
      </Layout>
    </RoleProvider>
  </DashboardProvider>
);

export const DataRouterApp: React.FC = () => {
  return (
    <AuthProvider>
      <DataRouterAppInner />
    </AuthProvider>
  );
};

const DataRouterAppInner: React.FC = () => {
  // Team Bulletin Redirect Component
  const TeamBulletinRedirectElement: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { activeTeamId } = useActiveTeamStore();

    useEffect(() => {
      if (!user) {
        navigate(ROUTES.LOGIN);
        return;
      }

      if (activeTeamId) {
        navigate(`/team/${activeTeamId}/bulletin`);
      } else {
        // No active team, redirect to teams page
        navigate(ROUTES.TEAMS);
      }
    }, [user, activeTeamId, navigate]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
          <p className="font-medium text-text-secondary">
            Loading team bulletin...
          </p>
        </div>
      </div>
    );
  };

  // Root redirect component that handles authentication
  const RootRedirectComponent: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isInitializing, setIsInitializing] = useState(true);
    const [hasTimedOut, setHasTimedOut] = useState(false);

    useEffect(() => {
      // Only set timeout if we're still waiting for auth state (user is undefined)
      // If user is already determined (truthy or null), don't use timeout
      if (user !== undefined) return;

      const timeout = setTimeout(() => {
        console.warn(
          "🔄 Auth initialization timed out, assuming not authenticated"
        );
        setHasTimedOut(true);
        setIsInitializing(false);
        navigate(ROUTES.LOGIN, { replace: true });
      }, 3000); // Reduced to 3 seconds since login is now fast

      return () => clearTimeout(timeout);
    }, [user, navigate]);

    useEffect(() => {
      if (hasTimedOut) return; // Already handled by timeout

      // If we have a user, redirect to dashboard
      if (user) {
        console.log(
          "🔄 RootRedirectComponent: User authenticated, redirecting to dashboard"
        );
        setIsInitializing(false);
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else if (user === null) {
        // User is explicitly null (not undefined), so auth check is complete
        console.log("🔄 RootRedirectComponent: No user, redirecting to login");
        setIsInitializing(false);
        navigate(ROUTES.LOGIN, { replace: true });
      }
      // If user is undefined, we're still waiting for auth state
    }, [user, navigate, hasTimedOut]);

    if (isInitializing) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
            <p className="font-medium text-text-secondary">
              Loading BoxCall...
            </p>
            <p className="text-sm text-text-muted mt-2">
              Checking authentication...
            </p>
          </div>
        </div>
      );
    }

    // This should not be reached, but just in case
    return null;
  };

  // Role-gated non-team loaders created via factory
  const requirePlayerLoader = useMemo(() => requireRolesLoader(["player"]), []);

  const routes = useMemo<RouteObject[]>(
    () => [
      {
        path: "/",
        element: <RootLayout />,
        errorElement: <RouteErrorElement />,
        children: [
          // Public (no app shell)
          {
            path: ROUTES.LOGIN,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyLoginPage />
              </Suspense>
            ),
          },

          // App shell with NavBar + Sidebar
          {
            element: <AppShell />,
            children: [
              // Root redirect with authentication check
              {
                index: true,
                element: <RootRedirectComponent />,
              },

              {
                path: ROUTES.COACH,
                loader: requireCoachOrAdminLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyCoachManagementPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.PLAYER,
                loader: requirePlayerLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyPlayerDashboardPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.ADMIN,
                loader: requireCoachOrAdminLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyAchievementAdminPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.DASHBOARD,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyDashboardPage />
                  </Suspense>
                ),
              },
              // Calendar - Available to everyone
              {
                path: ROUTES.CALENDAR,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyCalendarShellPage />
                  </Suspense>
                ),
              },
              // Planner - Weekly planning dashboard for coaches
              {
                path: ROUTES.PLANNER,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyPlannerPage />
                  </Suspense>
                ),
              },
              // Awards - Give out awards to players and staff (coaches only)
              {
                path: "/awards",
                loader: requireCoachOrAdminLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-text-primary mb-4">
                          Awards System
                        </h1>
                        <p className="text-text-secondary">
                          Coming soon! Award management for players and staff.
                        </p>
                      </div>
                    </div>
                  </Suspense>
                ),
              },
              // Team Bulletin redirect — redirects to active team bulletin
              {
                path: "/team-bulletin",
                loader: requireAuthenticatedLoader,
                element: <TeamBulletinRedirectElement />,
              },
              // Team Bulletin — all members
              {
                path: "/team/:teamId/bulletin",
                loader: requireTeamMemberLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTeamBulletin />
                  </Suspense>
                ),
              },
              // Team Analytics — premium
              {
                path: "/team/:teamId/analytics",
                loader: requireTeamAnalyticsLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyAnalyticsPage />
                  </Suspense>
                ),
              },
              // Additional migrated routes (non-team)
              {
                path: ROUTES.PLAYBOOK,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <PlaybookProvider>
                      <LazyPlaybookPage />
                    </PlaybookProvider>
                  </Suspense>
                ),
              },
              {
                path: ROUTES.PRACTICE_PLANS,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyPracticePlansPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.GAME_PLANS,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyGamePlansPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.BOXCALL,
                loader: requireCoachOrAdminLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyBoxCall />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.PROFILE,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyProfilePage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.COLLABORATIVE_DEMO,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyCollaborativeDemoPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.TEAMS,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTeamsPage />
                  </Suspense>
                ),
              },
              // Team bulletin - requires team membership
              {
                path: "/team/:teamId/bulletin",
                loader: requireTeamMemberLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTeamBulletin />
                  </Suspense>
                ),
              },
              // Team management
              {
                path: ROUTES.CREATE_TEAM,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyCreateTeam />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.JOIN_TEAM,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyJoinTeam />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.CREATE_COACH_ACCOUNT,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyCreateCoachAccount />
                  </Suspense>
                ),
              },
              // Legal & info (kept authenticated like legacy)
              {
                path: ROUTES.ABOUT,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyAboutPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.PRIVACY,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyPrivacyPolicyPage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.TERMS,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTermsOfServicePage />
                  </Suspense>
                ),
              },
              {
                path: ROUTES.CONTACT,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyContactPage />
                  </Suspense>
                ),
              },
              // Design System Showcase (dev only)
              {
                path: ROUTES.DESIGN_SYSTEM,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyDesignSystemShowcase />
                  </Suspense>
                ),
              },
              // Social Features Demo (dev/demo feature)
              {
                path: ROUTES.SOCIAL_FEATURES_DEMO,
                loader: requireAuthenticatedLoader,
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazySocialFeaturesDemo />
                  </Suspense>
                ),
              },
              // 404
              {
                path: "*",
                element: (
                  <div className="min-h-screen flex items-center justify-center surface-app">
                    <div className="text-center max-w-md mx-auto p-6">
                      <p className="font-medium text-text-secondary">
                        404 - Page Not Found
                      </p>
                    </div>
                  </div>
                ),
              },
              // Dev only diagnostics route (parity with legacy)
              ...(import.meta.env.DEV
                ? [
                    {
                      path: ROUTES.DEV_DIAGNOSTICS,
                      loader: requireAuthenticatedLoader,
                      element: (
                        <Suspense fallback={<RouteLoadingSpinner />}>
                          {React.createElement(
                            React.lazy(() => import("../pages/DiagnosticsPage"))
                          )}
                        </Suspense>
                      ),
                    } as RouteObject,
                  ]
                : []),
            ],
          },
        ],
      },
    ],
    [requirePlayerLoader]
  );

  const router = useMemo(() => createBrowserRouter(routes), [routes]);
  return (
    <RouterProvider router={router} fallbackElement={<RouteLoadingSpinner />} />
  );
};

export default DataRouterApp;
