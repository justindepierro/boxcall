import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../components/auth";
import { Icon } from "../components/ui/Icon/Icon";
import {
  LazyDashboardPage,
  LazyLoginPage,
  LazyCalendarPage,
  LazyProfilePage,
  LazyTeamBulletin,
  LazyCreateTeam,
  LazyJoinTeam,
  LazyCreateCoachAccount,
  LazyBoxCall,
  LazyPlaybookPage,
  LazyTeamSettings,
  LazyAboutPage,
  LazyPrivacyPolicyPage,
  LazyTermsOfServicePage,
  LazyContactPage,
  LazyCoachManagementPage,
  LazyPlayerDashboardPage,
} from "../components/lazy/LazyRoutes";
import {
  ProtectedRoute,
  PublicRoute,
  RoleProtectedRoute,
  SubscriptionRoute,
  TeamMemberRoute,
} from "../routes";

// Route loading fallback with better UX
const RouteLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">
        Loading page...
      </p>
    </div>
  </div>
);

/**
 * AppRouter Component
 *
 * Main routing configuration for the BoxCall application.
 * Features:
 * - Route-based code splitting with Suspense
 * - Protected routes with authentication checks
 * - Role-based access control (RBAC)
 * - Team membership validation
 * - Subscription tier protection
 * - Clean 404 handling
 */
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          {/* Only accessible when NOT authenticated */}
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

          {/* ==================== CORE PROTECTED ROUTES ==================== */}
          {/* Dashboard - Landing page for authenticated users */}
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

          {/* User Profile Management */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Master Calendar - Available to all authenticated users */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCalendarPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* ==================== TEAM-SPECIFIC ROUTES ==================== */}
          {/* ==================== TEAM-SPECIFIC ROUTES ==================== */}
          {/* Team Bulletin - All team members can view */}
          <Route
            path="/team/:teamId/bulletin"
            element={
              <ProtectedRoute>
                <TeamMemberRoute
                  allowedTeamRoles={["coach", "player", "family", "admin"]}
                >
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTeamBulletin />
                  </Suspense>
                </TeamMemberRoute>
              </ProtectedRoute>
            }
          />

          {/* Team Settings - Coaches and admins only */}
          <Route
            path="/team/:teamId/settings"
            element={
              <ProtectedRoute>
                <TeamMemberRoute allowedTeamRoles={["coach", "admin"]}>
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyTeamSettings />
                  </Suspense>
                </TeamMemberRoute>
              </ProtectedRoute>
            }
          />

          {/* ==================== PREMIUM FEATURES ==================== */}
          {/* Premium Analytics - Requires subscription */}
          <Route
            path="/team/:teamId/analytics"
            element={
              <TeamMemberRoute allowedTeamRoles={["coach", "admin"]}>
                <SubscriptionRoute requiredTiers={["team_premium"]}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 flex items-center justify-center">
                      <Icon name="bar-chart" size="lg" className="mr-2" />
                      Premium Analytics
                    </h1>
                    <p className="text-gray-600">
                      Advanced team analytics and reporting tools.
                    </p>
                  </div>
                </SubscriptionRoute>
              </TeamMemberRoute>
            }
          />

          {/* ==================== COACH & ADMIN TOOLS ==================== */}
          {/* ==================== COACH & ADMIN TOOLS ==================== */}
          {/* BoxCall - Coaches and admins only */}
          <Route
            path="/boxcall"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["coach", "admin"]}>
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    <LazyBoxCall />
                  </Suspense>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* ==================== ROLE-SPECIFIC DASHBOARDS ==================== */}
          {/* Coach Management Hub - Coaches and admins only */}
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCoachManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Player Dashboard - Players only */}
          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPlayerDashboardPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* ==================== GENERAL ACCESS ROUTES ==================== */}
          {/* Playbook - All authenticated users */}
          <Route
            path="/playbook"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPlaybookPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* ==================== TEAM MANAGEMENT ==================== */}
          {/* ==================== TEAM MANAGEMENT ==================== */}
          {/* Create Team - Protected route with permission check */}
          <Route
            path="/create-team"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCreateTeam />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Join Team - All authenticated users */}
          <Route
            path="/join-team"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyJoinTeam />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Create Coach Account - All authenticated users */}
          <Route
            path="/create-coach-account"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyCreateCoachAccount />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* ==================== DEVELOPMENT & TESTING ==================== */}
          {/* ==================== LEGAL & INFO PAGES ==================== */}
          {/* ==================== LEGAL & INFO PAGES ==================== */}
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyAboutPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyPrivacyPolicyPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyTermsOfServicePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoadingSpinner />}>
                  <LazyContactPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* ==================== NAVIGATION & FALLBACKS ==================== */}
          {/* Root redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Route */}
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="mb-6">
                    <Icon name="alert" size="xl" color="secondary" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.history.back()}
                      className="w-full bg-brand-jade text-white px-6 py-3 rounded-sm hover:bg-interaction-jade font-sans font-semibold transition-colors"
                    >
                      <Icon
                        name="arrow-left"
                        size="sm"
                        className="mr-2 inline"
                      />
                      Go Back
                    </button>
                    <button
                      onClick={() => (window.location.href = "/dashboard")}
                      className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 font-sans font-semibold transition-colors"
                    >
                      <Icon name="home" size="sm" className="mr-2 inline" />
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
