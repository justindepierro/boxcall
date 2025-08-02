import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../components/auth";
import { 
  ProtectedRoute, 
  PublicRoute, 
  RoleProtectedRoute,
  SuperAdminRoute,
  TeamMemberRoute,
  SubscriptionRoute 
} from "../routes";
import { 
  TeamManagementRoute
} from "../routes/PermissionRoute";
import { 
  DashboardPage, 
  LoginPage, 
  AdminPage,
  SuperAdminPage,
  TeamManagementPage,
  ProfilePage,
  TeamDashboard 
} from "../pages";
import AnimationShowcasePage from "../pages/AnimationShowcasePage";

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
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Routes - Require specific roles */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </RoleProtectedRoute>
            }
          />

          {/* Super Admin Routes - Developer access only */}
          <Route
            path="/super-admin"
            element={
              <SuperAdminRoute>
                <SuperAdminPage />
              </SuperAdminRoute>
            }
          />

          {/* Animation Showcase - Development route */}
          <Route
            path="/animations"
            element={
              <ProtectedRoute>
                <AnimationShowcasePage />
              </ProtectedRoute>
            }
          />

          {/* Team Management Routes - Permission-based access */}
          <Route
            path="/team/:teamId/manage"
            element={
              <TeamManagementRoute>
                <TeamManagementPage />
              </TeamManagementRoute>
            }
          />

          {/* Team Dashboard - All team members can view (temporarily reverted) */}
          <Route
            path="/team/:teamId"
            element={
              <TeamMemberRoute allowedTeamRoles={["head_coach", "coach", "player", "family", "manager"]}>
                <TeamDashboard />
              </TeamMemberRoute>
            }
          />

          {/* Premium Feature Example - Requires subscription */}
          <Route
            path="/team/:teamId/analytics"
            element={
              <TeamMemberRoute allowedTeamRoles={["head_coach", "coach"]}>
                <SubscriptionRoute requiredTiers={["team_premium"]}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">📊 Premium Analytics</h1>
                    <p>Advanced team analytics and reporting tools.</p>
                  </div>
                </SubscriptionRoute>
              </TeamMemberRoute>
            }
          />

          {/* Catch-all Routes */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
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
                    className="bg-jade-500 text-white px-4 py-2 rounded-sm hover:bg-jade-600 font-sans font-semibold"
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
