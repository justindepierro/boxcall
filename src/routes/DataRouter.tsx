import React, { Suspense, useEffect } from "react";
import {
  useNavigate,
  Navigate,
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../app/auth-store";
import { saveReturnUrl, createLoginUrl } from "../utils/navigationUtils";
import {
  LazyDashboardPage,
  LazyLoginPage,
  LazyTeamBulletin,
  LazyAnalyticsPage,
  LazyBoxCall,
  LazyPracticeSession,
  LazyGameSession,
  LazyPlaybookPage,
  LazyFormationMapperPage,
  LazyRosterPage,
  LazyPlayerDetailPage,
  LazyPracticePlansPage,
  LazyGamePlansPage,
  LazyProfilePage,
  LazyCoachManagementPage,
  LazyPlayerDashboardPage,
  LazyAchievementAdminPage,
  LazySuperAdminAnalyticsTestPage,
  LazyCreateTeam,
  LazyJoinTeam,
  LazyCreateCoachAccount,
  LazyAboutPage,
  LazyPrivacyPolicyPage,
  LazyTermsOfServicePage,
  LazyContactPage,
  LazyTeamSettings,
  LazySocialFeaturesDemo,
  LazyCalendarShellPage,
  LazyPlannerPage,
  RouteLoadingSpinner,
  LazyAwardsPage,
  LazyTemplatesPage,
  LazyDesignSystemShowcase,
  LazyHealthCheckPage,
  LazyReadinessCheckPage,
  LazyLivenessCheckPage,
} from "../components/lazy/LazyRoutes";
import ScrollToTop from "./ScrollToTop";
import { TeamParamSync } from "./TeamParamSync";
import { teamRoutes } from "./paths";
import { Layout } from "../components/layout/Layout";
import { useActiveTeamStore } from "../state/activeTeamStore";
import { PlaybookProvider } from "../contexts/PlaybookContext";

// Component for legacy team bulletin redirects
const LegacyTeamBulletinRedirect: React.FC = () => {
  const navigate = useNavigate();
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);

  useEffect(() => {
    if (activeTeamId) {
      navigate(teamRoutes.bulletin(activeTeamId), { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [activeTeamId, navigate]);

  return <RouteLoadingSpinner />;
};

// Protected route wrapper with return URL support
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoadingSpinner />;
  }

  if (!user) {
    // Save current location as return URL
    saveReturnUrl(location.pathname + location.search);
    // Redirect to login
    return (
      <Navigate
        to={createLoginUrl(location.pathname + location.search)}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Authenticated layout with sidebar and global search
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Layout>
    <ScrollToTop />
    <TeamParamSync />
    {children}
  </Layout>
);

// Main router component
export const DataRouterApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyLoginPage />
            </Suspense>
          }
        />

        {/* Health check API routes - must be public for monitoring */}
        <Route
          path="/health"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyHealthCheckPage />
            </Suspense>
          }
        />

        <Route
          path="/ready"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyReadinessCheckPage />
            </Suspense>
          }
        />

        <Route
          path="/live"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyLivenessCheckPage />
            </Suspense>
          }
        />

        <Route
          path="/register"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyCreateCoachAccount />
            </Suspense>
          }
        />

        <Route
          path="/about"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyAboutPage />
            </Suspense>
          }
        />

        <Route
          path="/privacy"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyPrivacyPolicyPage />
            </Suspense>
          }
        />

        <Route
          path="/terms"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyTermsOfServicePage />
            </Suspense>
          }
        />

        <Route
          path="/contact"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyContactPage />
            </Suspense>
          }
        />

        <Route
          path="/design-system"
          element={
            <Suspense fallback={<RouteLoadingSpinner />}>
              <LazyDesignSystemShowcase />
            </Suspense>
          }
        />

        {/* Legacy redirects */}
        <Route path="/teams" element={<LegacyTeamBulletinRedirect />} />
        <Route path="/team-bulletin" element={<LegacyTeamBulletinRedirect />} />

        {/* Protected routes with layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyDashboardPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyProfilePage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-team"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCreateTeam />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/join-team"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyJoinTeam />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playbook"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PlaybookProvider>
                    <LazyPlaybookPage />
                  </PlaybookProvider>
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playbook/formation-mapper"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PlaybookProvider>
                    <LazyFormationMapperPage />
                  </PlaybookProvider>
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roster"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyRosterPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roster/:playerId"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPlayerDetailPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-plans"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPracticePlansPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/game-plans"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyGamePlansPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach-management"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCoachManagementPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/player-dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPlayerDashboardPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/achievement-admin"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyAchievementAdminPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/analytics-test"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazySuperAdminAnalyticsTestPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyAnalyticsPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazySocialFeaturesDemo />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCalendarShellPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPlannerPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/boxcall"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyBoxCall />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/boxcall/practice/:scriptId"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPracticeSession />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/boxcall/game/:planId"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyGameSession />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/awards"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyAwardsPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyTemplatesPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Team-specific routes */}
        <Route
          path="/team/:teamId/bulletin"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyTeamBulletin />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/settings"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyTeamSettings />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/playbook"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <PlaybookProvider>
                    <LazyPlaybookPage />
                  </PlaybookProvider>
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/practice-plans"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPracticePlansPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/game-plans"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyGamePlansPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/analytics"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyAnalyticsPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/social"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazySocialFeaturesDemo />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/calendar"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCalendarShellPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team/:teamId/planner"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPlannerPage />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default DataRouterApp;
