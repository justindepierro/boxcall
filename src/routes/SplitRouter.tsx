import { Typography } from "../components/design-system/Typography";
/**
 * Route-based Code Splitting
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Button } from "../components/ui";
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

const CalendarShellPage = lazy(() =>
  dynamicImportWithRetry(() =>
    import("../pages/CalendarShellPage").then((m) => ({
      default: m.CalendarShellPage,
    }))
  )
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
        path="/calendar"
        element={
          <RouteLoader routeName="calendar">
            <CalendarShellPage />
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
            <div className="min-h-screen surface-app flex items-center justify-center p-4">
              <div className="text-center">
                <Typography
                  variant="headline-md"
                  as="h1"
                  className="text-gray-900 mb-2"
                >
                  Page Not Found
                </Typography>
                <p className="text-gray-600 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </RouteLoader>
        }
      />
    </Routes>
  );
};

export default SplitRouter;
