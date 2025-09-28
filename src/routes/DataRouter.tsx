import React, { Suspense, useMemo, useEffect, useState, memo } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import { useAuth } from "../app/auth-store";
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
  LazySocialFeaturesDemo,
  LazyCalendarShellPage,
  LazyPlannerPage,
  RouteLoadingSpinner,
} from "../components/lazy/LazyRoutes";
import ScrollToTop from "./ScrollToTop";
import { TeamParamSync } from "./TeamParamSync";
import { ROUTES } from "./paths";
import {
  requireTeamAnalyticsLoader,
  requireAuthenticatedLoader,
  requireTeamMemberLoader,
  requireCoachOrAdminLoader,
  requirePlayerLoader,
} from "./loaderAuth";
import { Layout } from "../components/layout/Layout";
const RootLayout: React.FC = () => (
  <>
    <ScrollToTop />
    <TeamParamSync />
    <Outlet />
  </>
);

// Authenticated layout wrapper that uses the main Layout component
const AuthenticatedLayout: React.FC = () => (
  <Layout>
    <Outlet />
  </Layout>
);

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
          <p className="font-medium text-text-secondary">Loading BoxCall...</p>
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

export const DataRouterApp: React.FC = () => {
  return <DataRouterAppInner />;
};

const DataRouterAppInner: React.FC = memo(() => {
  const { loading } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth to initialize before rendering router
  useEffect(() => {
    if (!loading) {
      setAuthReady(true);
    }
  }, [loading]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Role-gated non-team loaders created via factory

  const routes = useMemo<RouteObject[]>(
    () => [
      {
        path: "/",
        element: <RootRedirectComponent />,
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyLoginPage />
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyCreateCoachAccount />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyAboutPage />
          </Suspense>
        ),
      },
      {
        path: "/privacy",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyPrivacyPolicyPage />
          </Suspense>
        ),
      },
      {
        path: "/terms",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyTermsOfServicePage />
          </Suspense>
        ),
      },
      {
        path: "/contact",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyContactPage />
          </Suspense>
        ),
      },
      // Authenticated routes with layout
      {
        path: "/",
        element: <AuthenticatedLayout />,
        loader: requireAuthenticatedLoader,
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "teams",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyTeamsPage />
              </Suspense>
            ),
          },
          {
            path: "create-team",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyCreateTeam />
              </Suspense>
            ),
          },
          {
            path: "join-team",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyJoinTeam />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyProfilePage />
              </Suspense>
            ),
          },
          {
            path: "playbook",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPlaybookPage />
              </Suspense>
            ),
          },
          {
            path: "practice-plans",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPracticePlansPage />
              </Suspense>
            ),
          },
          {
            path: "game-plans",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyGamePlansPage />
              </Suspense>
            ),
          },
          {
            path: "coach-management",
            loader: requireCoachOrAdminLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyCoachManagementPage />
              </Suspense>
            ),
          },
          {
            path: "player-dashboard",
            loader: requirePlayerLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPlayerDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "achievement-admin",
            loader: requireCoachOrAdminLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyAchievementAdminPage />
              </Suspense>
            ),
          },
          {
            path: "analytics",
            loader: requireTeamAnalyticsLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyAnalyticsPage />
              </Suspense>
            ),
          },
          {
            path: "social",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazySocialFeaturesDemo />
              </Suspense>
            ),
          },
          {
            path: "calendar",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyCalendarShellPage />
              </Suspense>
            ),
          },
          {
            path: "planner",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPlannerPage />
              </Suspense>
            ),
          },
          {
            path: "boxcall",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyBoxCall />
              </Suspense>
            ),
          },
        ],
      },
      // Team-specific routes
      {
        path: "/team/:teamId",
        loader: requireTeamMemberLoader,
        element: <RootLayout />,
        children: [
          {
            path: "bulletin",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyTeamBulletin />
              </Suspense>
            ),
          },
          {
            path: "playbook",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPlaybookPage />
              </Suspense>
            ),
          },
          {
            path: "practice-plans",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPracticePlansPage />
              </Suspense>
            ),
          },
          {
            path: "game-plans",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyGamePlansPage />
              </Suspense>
            ),
          },
          {
            path: "analytics",
            loader: requireTeamAnalyticsLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyAnalyticsPage />
              </Suspense>
            ),
          },
          {
            path: "social",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazySocialFeaturesDemo />
              </Suspense>
            ),
          },
          {
            path: "calendar",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyCalendarShellPage />
              </Suspense>
            ),
          },
          {
            path: "planner",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyPlannerPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
    []
  );

  const router = useMemo(() => createBrowserRouter(routes), [routes]);

  // Show loading spinner while auth is initializing
  if (!authReady) {
    return <RouteLoadingSpinner />;
  }

  return (
    <RouterProvider router={router} fallbackElement={<RouteLoadingSpinner />} />
  );
});

export default DataRouterApp;
