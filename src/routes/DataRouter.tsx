import React, { Suspense, useMemo, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
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
  LazyCreateTeam,
  LazyJoinTeam,
  LazyCreateCoachAccount,
  LazyAboutPage,
  LazyPrivacyPolicyPage,
  LazyTermsOfServicePage,
  LazyContactPage,
  LazyCollaborativeDemoPage,
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
import DiagramPaneRoute from "../components/playbook/DiagramPaneRoute";

// Root wrapper so loaders run pre-render and providers are applied once
const RootLayout: React.FC = () => (
  <>
    <ScrollToTop />
    <TeamParamSync />
    <AuthProvider>
      <Outlet />
    </AuthProvider>
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
              // Root redirect for convenience
              {
                index: true,
                element: <Navigate to={ROUTES.DASHBOARD} replace />,
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
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          Awards System
                        </h1>
                        <p className="text-gray-600">
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
              // Lightweight diagram pane route (kept non-lazy like legacy)
              {
                path: "/playbook/diagram",
                loader: requireAuthenticatedLoader,
                element: <DiagramPaneRoute />,
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
                // loader: requireAuthenticatedLoader, // Temporarily disabled for demo
                element: (
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTeamsPage />
                  </Suspense>
                ),
              },
              // Team bulletin redirect - handles /team-bulletin navigation
              {
                path: "/team-bulletin",
                loader: requireAuthenticatedLoader,
                element: <TeamBulletinRedirectElement />,
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
    <Suspense fallback={<RouteLoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default DataRouterApp;
