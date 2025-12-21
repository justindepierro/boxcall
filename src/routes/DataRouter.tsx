import React from "react";
import {
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
  LazyResetPasswordPage,
  LazyTeamBulletin,
  LazyAnalyticsPage,
  LazyBoxCall,
  LazySessionHistory,
  LazyPracticeSession,
  LazyGameSession,
  LazyPlaybookPage,
  LazyFormationLibraryPage,
  LazyPersonnelLibraryPage,
  LazyRosterPage,
  LazyPlayerDetailPage,
  LazyPracticePlansPage,
  LazyGamePlansPage,
  LazyProfilePage,
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
  LazyTeamSettings,
  LazyTeamAnnouncements,
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
import { InvitationAcceptPage } from "../pages/InvitationAcceptPage";
import ScrollToTop from "./ScrollToTop";
import { TeamParamSync } from "./TeamParamSync";
import { Layout } from "../components/layout/Layout";
import { PlaybookProvider } from "../contexts/PlaybookContext";

// Component for legacy team bulletin redirects

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

// Cleaner protected route helper without excessive nesting
const ProtectedPage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute>
    <AuthenticatedLayout>{children}</AuthenticatedLayout>
  </ProtectedRoute>
);

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

const PublicRoutes = (
  <>
    <Route path="/login" element={<LazyLoginPage />} />
    <Route path="/reset-password" element={<LazyResetPasswordPage />} />

    {/* Health check API routes - must be public for monitoring */}
    <Route path="/health" element={<LazyHealthCheckPage />} />
    <Route path="/ready" element={<LazyReadinessCheckPage />} />
    <Route path="/live" element={<LazyLivenessCheckPage />} />

    <Route path="/register" element={<LazyCreateCoachAccount />} />
    <Route path="/invite/accept" element={<InvitationAcceptPage />} />

    <Route path="/about" element={<LazyAboutPage />} />
    <Route path="/privacy" element={<LazyPrivacyPolicyPage />} />
    <Route path="/terms" element={<LazyTermsOfServicePage />} />
    <Route path="/contact" element={<LazyContactPage />} />

    <Route path="/design-system" element={<LazyDesignSystemShowcase />} />
  </>
);

const ProtectedCoreRoutes = (
  <>
    <Route
      path="/dashboard"
      element={
        <ProtectedPage>
          <LazyDashboardPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedPage>
          <LazyProfilePage />
        </ProtectedPage>
      }
    />

    <Route
      path="/create-team"
      element={
        <ProtectedPage>
          <LazyCreateTeam />
        </ProtectedPage>
      }
    />

    <Route
      path="/join-team"
      element={
        <ProtectedPage>
          <LazyJoinTeam />
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedPlaybookRoutes = (
  <>
    <Route
      path="/playbook"
      element={
        <ProtectedPage>
          <PlaybookProvider>
            <LazyPlaybookPage />
          </PlaybookProvider>
        </ProtectedPage>
      }
    />

    <Route
      path="/playbook/formations"
      element={
        <ProtectedPage>
          <PlaybookProvider>
            <LazyFormationLibraryPage />
          </PlaybookProvider>
        </ProtectedPage>
      }
    />

    <Route
      path="/playbook/personnel"
      element={
        <ProtectedPage>
          <PlaybookProvider>
            <LazyPersonnelLibraryPage />
          </PlaybookProvider>
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedRosterRoutes = (
  <>
    <Route
      path="/roster"
      element={
        <ProtectedPage>
          <LazyRosterPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/roster/:playerId"
      element={
        <ProtectedPage>
          <LazyPlayerDetailPage />
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedPlanningRoutes = (
  <>
    <Route
      path="/practice-plans"
      element={
        <ProtectedPage>
          <LazyPracticePlansPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/game-plans"
      element={
        <ProtectedPage>
          <LazyGamePlansPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/analytics"
      element={
        <ProtectedPage>
          <LazyAnalyticsPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/calendar"
      element={
        <ProtectedPage>
          <LazyCalendarShellPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/planner"
      element={
        <ProtectedPage>
          <LazyPlannerPage />
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedAdminRoutes = (
  <>
    <Route
      path="/coach-management"
      element={
        <ProtectedPage>
          <LazyCoachManagementPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/player-dashboard"
      element={
        <ProtectedPage>
          <LazyPlayerDashboardPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/achievement-admin"
      element={
        <ProtectedPage>
          <LazyAchievementAdminPage />
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedBoxCallRoutes = (
  <>
    <Route
      path="/boxcall"
      element={
        <ProtectedPage>
          <LazyBoxCall />
        </ProtectedPage>
      }
    />

    <Route
      path="/boxcall/history"
      element={
        <ProtectedPage>
          <LazySessionHistory />
        </ProtectedPage>
      }
    />

    <Route
      path="/boxcall/practice/:scriptId"
      element={
        <ProtectedPage>
          <LazyPracticeSession />
        </ProtectedPage>
      }
    />

    <Route
      path="/boxcall/game/:planId"
      element={
        <ProtectedPage>
          <LazyGameSession />
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedMiscRoutes = (
  <>
    <Route
      path="/awards"
      element={
        <ProtectedPage>
          <LazyAwardsPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/templates"
      element={
        <ProtectedPage>
          <LazyTemplatesPage />
        </ProtectedPage>
      }
    />
  </>
);

const ProtectedGlobalRoutes = (
  <>
    {ProtectedCoreRoutes}
    {ProtectedPlaybookRoutes}
    {ProtectedRosterRoutes}
    {ProtectedPlanningRoutes}
    {ProtectedAdminRoutes}
    {ProtectedBoxCallRoutes}
    {ProtectedMiscRoutes}
  </>
);

const TeamScopedRoutes = (
  <>
    <Route
      path="/team/:teamId/bulletin"
      element={
        <ProtectedPage>
          <LazyTeamBulletin />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/settings"
      element={
        <ProtectedPage>
          <LazyTeamSettings />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/announcements"
      element={
        <ProtectedPage>
          <LazyTeamAnnouncements />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/playbook"
      element={
        <ProtectedPage>
          <PlaybookProvider>
            <LazyPlaybookPage />
          </PlaybookProvider>
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/practice-plans"
      element={
        <ProtectedPage>
          <LazyPracticePlansPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/game-plans"
      element={
        <ProtectedPage>
          <LazyGamePlansPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/analytics"
      element={
        <ProtectedPage>
          <LazyAnalyticsPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/calendar"
      element={
        <ProtectedPage>
          <LazyCalendarShellPage />
        </ProtectedPage>
      }
    />

    <Route
      path="/team/:teamId/planner"
      element={
        <ProtectedPage>
          <LazyPlannerPage />
        </ProtectedPage>
      }
    />
  </>
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
        {PublicRoutes}
        {ProtectedGlobalRoutes}
        {TeamScopedRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default DataRouterApp;
