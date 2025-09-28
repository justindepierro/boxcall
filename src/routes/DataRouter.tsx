import React, { Suspense, useMemo, useEffect, useState, memo } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
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
  LazyAwardsPage,
  LazyTemplatesPage,
  LazyDesignSystemShowcase,
} from "../components/lazy/LazyRoutes";
import ScrollToTop from "./ScrollToTop";
import { TeamParamSync } from "./TeamParamSync";
import { ROUTES, teamRoutes } from "./paths";
import {
  requireTeamAnalyticsLoader,
  requireAuthenticatedLoader,
  requireTeamMemberLoader,
  requireCoachOrAdminLoader,
  requirePlayerLoader,
} from "./loaderAuth";
import { Layout } from "../components/layout/Layout";
import { useActiveTeamStore } from "../state/activeTeamStore";
import { PlaybookProvider } from "../contexts/PlaybookContext";
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

const LegacyTeamBulletinRedirect: React.FC = () => {
  const navigate = useNavigate();
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);

  useEffect(() => {
    if (activeTeamId) {
      navigate(teamRoutes.bulletin(activeTeamId), { replace: true });
    } else {
      navigate(ROUTES.TEAMS, { replace: true });
    }
  }, [activeTeamId, navigate]);

  return <RouteLoadingSpinner />;
};

// Root redirect component that handles authentication
const RootRedirectComponent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
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

  if (user) {
    if (location.pathname !== ROUTES.DASHBOARD) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
    return null;
  }

  if (location.pathname === ROUTES.LOGIN) {
    return null;
  }

  return <Navigate to={ROUTES.LOGIN} replace />;
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
      {
        path: "/design-system",
        element: (
          <Suspense fallback={<RouteLoadingSpinner />}>
            <LazyDesignSystemShowcase />
          </Suspense>
        ),
      },
      {
        path: "/team-bulletin",
        element: <LegacyTeamBulletinRedirect />,
      },
      // Authenticated routes with layout
      {
        path: "/",
        element: <AuthenticatedLayout />,
        loader: requireAuthenticatedLoader,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyDashboardPage />
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
                <PlaybookProvider>
                  <LazyPlaybookPage />
                </PlaybookProvider>
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
          {
            path: "awards",
            loader: requireCoachOrAdminLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyAwardsPage />
              </Suspense>
            ),
          },
          {
            path: "templates",
            loader: requireCoachOrAdminLoader,
            element: (
              <Suspense fallback={<RouteLoadingSpinner />}>
                <LazyTemplatesPage />
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
                <PlaybookProvider>
                  <LazyPlaybookPage />
                </PlaybookProvider>
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

  const spinner = <RouteLoadingSpinner />;

  return (
    <RouterProvider
      router={router}
      fallbackElement={spinner}
      hydrateFallbackElement={spinner}
    />
  );
});

export default DataRouterApp;
