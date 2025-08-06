import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../components/auth";
import { Icon } from "../components/ui/Icon/Icon";
import {
  LazyDashboardPage,
  LazyLoginPage,
  LazyPhase4DemoPage,
  LazyCalendarPage,
  LazyProfilePage,
  LazyTeamBulletin,
  LazyCreateTeam,
  LazyJoinTeam,
  LazyCreateCoachAccount,
  LazyBoxCall,
  LazyPlaybookPage,
  LazyTeamSettings,
  LazyTemplates,
  LazyPlayground,
  LazyAboutPage,
  LazyPrivacyPolicyPage,
  LazyTermsOfServicePage,
  LazyContactPage,
} from "../components/lazy/LazyRoutes";
import {
  ProtectedRoute,
  PublicRoute,
  RoleProtectedRoute,
  SubscriptionRoute,
  TeamMemberRoute,
} from "../routes";

// Route loading fallback
const RouteLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
    <span className="ml-3 text-gray-600">Loading page...</span>
  </div>
);

/**
 * AppRouter Component
 *
 * Main routing configuration for the BoxCall application.
 * Handles protected routes, public routes, and role-based access.
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyLoginPage />
                </Suspense>
              </PublicRoute>
            }
          />
          {/* Protected Routes - Require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyDashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Phase 4 Demo Route - Data Resolution Testing */}
          <Route
            path="/phase4-demo"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPhase4DemoPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <LazyProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Master Calendar - Available to all authenticated users */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <LazyCalendarPage />
              </ProtectedRoute>
            }
          />
          {/* Team Bulletin - All team members can view */}
          <Route
            path="/team/:teamId/bulletin"
            element={
              <ProtectedRoute>
                <TeamMemberRoute
                  allowedTeamRoles={[
                    "head_coach",
                    "coach",
                    "player",
                    "manager",
                    "family",
                  ]}
                >
                  <LazyTeamBulletin />
                </TeamMemberRoute>
              </ProtectedRoute>
            }
          />
          {/* Premium Feature Example - Requires subscription */}
          <Route
            path="/team/:teamId/analytics"
            element={
              <TeamMemberRoute allowedTeamRoles={["head_coach", "coach"]}>
                <SubscriptionRoute requiredTiers={["team_premium"]}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 flex items-center justify-center">
                      <Icon name="bar-chart" size="lg" className="mr-2" />
                      Premium Analytics
                    </h1>
                    <p>Advanced team analytics and reporting tools.</p>
                  </div>
                </SubscriptionRoute>
              </TeamMemberRoute>
            }
          />
          {/* New Navigation Routes */}
          {/* BoxCall - Coaches only */}
          <Route
            path="/boxcall"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["coach", "admin"]}>
                  <LazyBoxCall />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          {/* Playbook - All authenticated users */}
          <Route
            path="/playbook"
            element={
              <ProtectedRoute>
                <LazyPlaybookPage />
              </ProtectedRoute>
            }
          />
          {/* Team Settings - Team-specific, coaches only */}
          <Route
            path="/team/:teamId/settings"
            element={
              <ProtectedRoute>
                <TeamMemberRoute
                  allowedTeamRoles={["head_coach", "coach", "manager"]}
                >
                  <LazyTeamSettings />
                </TeamMemberRoute>
              </ProtectedRoute>
            }
          />
          {/* Create Team - Protected route with permission check */}
          <Route
            path="/create-team"
            element={
              <ProtectedRoute>
                <LazyCreateTeam />
              </ProtectedRoute>
            }
          />
          {/* Join Team - All authenticated users */}
          <Route
            path="/join-team"
            element={
              <ProtectedRoute>
                <LazyJoinTeam />
              </ProtectedRoute>
            }
          />
          {/* Create Coach Account - All authenticated users */}
          <Route
            path="/create-coach-account"
            element={
              <ProtectedRoute>
                <LazyCreateCoachAccount />
              </ProtectedRoute>
            }
          />
          {/* Templates - Coaches only */}
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["coach", "admin"]}>
                  <LazyTemplates />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          {/* Playground - Admins only */}
          <Route
            path="/playground"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <LazyPlayground />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          {/* Catch-all Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Legal Pages - Public access within authenticated area */}
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <LazyAboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <ProtectedRoute>
                <LazyPrivacyPolicyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <ProtectedRoute>
                <LazyTermsOfServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <LazyContactPage />
              </ProtectedRoute>
            }
          />
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-brand-jade text-white px-4 py-2 rounded-sm hover:bg-interaction-jade font-sans font-semibold"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
