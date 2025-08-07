/**
 * Route-based Code Splitting
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RouteLoadingSkeleton } from "../components/ui/RouteLoadingSkeleton";
import AdvancedErrorBoundary from "../components/ui/AdvancedErrorBoundary";
import { dynamicImportWithRetry } from "../utils/bundleOptimization";

// Lazy-loaded route components with error handling (using existing pages)
const DashboardPage = lazy(() =>
  dynamicImportWithRetry(() => import("../pages/DashboardPage"))
);

const PlaybookPage = lazy(() =>
  dynamicImportWithRetry(() =>
    import("../pages/PlaybookPage").then((module) => ({
      default: module.PlaybookPage,
    }))
  )
);

const PracticePlannerPage = lazy(() =>
  dynamicImportWithRetry(() => import("../pages/PracticePlanner"))
);

const CalendarPage = lazy(() =>
  dynamicImportWithRetry(() => import("../pages/CalendarPage"))
);

const TeamSettingsPage = lazy(() =>
  dynamicImportWithRetry(() => import("../pages/TeamSettings"))
);

const ProfilePage = lazy(() =>
  dynamicImportWithRetry(() =>
    import("../pages/ProfilePage").then((module) => ({
      default: module.ProfilePage,
    }))
  )
);

const LoginPage = lazy(() =>
  dynamicImportWithRetry(() => import("../pages/LoginPage"))
);

const BoxCallPage = lazy(() =>
  dynamicImportWithRetry(() => import("../pages/BoxCall"))
);

// Route preloading utilities (moved to separate file to fix Fast Refresh)
// Import from '../utils/routeUtils' when needed

// Loading component with error boundary
const RouteLoader: React.FC<{
  children: React.ReactNode;
  routeName: string;
}> = ({ children, routeName }) => (
  <AdvancedErrorBoundary
    componentName={`Route:${routeName}`}
    enableReporting={true}
    maxRetries={2}
  >
    <Suspense fallback={<RouteLoadingSkeleton />}>{children}</Suspense>
  </AdvancedErrorBoundary>
);

// Main router component with code splitting
export const SplitRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteLoader routeName="home">
            <BoxCallPage />
          </RouteLoader>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RouteLoader routeName="dashboard">
            <DashboardPage />
          </RouteLoader>
        }
      />

      <Route
        path="/playbook"
        element={
          <RouteLoader routeName="playbook">
            <PlaybookPage />
          </RouteLoader>
        }
      />

      <Route
        path="/practice-planner"
        element={
          <RouteLoader routeName="practice-planner">
            <PracticePlannerPage />
          </RouteLoader>
        }
      />

      <Route
        path="/calendar"
        element={
          <RouteLoader routeName="calendar">
            <CalendarPage />
          </RouteLoader>
        }
      />

      <Route
        path="/settings"
        element={
          <RouteLoader routeName="settings">
            <TeamSettingsPage />
          </RouteLoader>
        }
      />

      <Route
        path="/profile"
        element={
          <RouteLoader routeName="profile">
            <ProfilePage />
          </RouteLoader>
        }
      />

      <Route
        path="/login"
        element={
          <RouteLoader routeName="login">
            <LoginPage />
          </RouteLoader>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <RouteLoader routeName="not-found">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Page Not Found
                </h1>
                <p className="text-gray-600 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-team-primary text-white px-4 py-2 rounded-lg hover:bg-team-primary/90 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </RouteLoader>
        }
      />
    </Routes>
  );
};

export default SplitRouter;
