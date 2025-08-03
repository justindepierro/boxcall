import { useEffect } from "react";
import "./App.css";
import { DevModeProvider } from "./app/dev-mode-store";
import DevModeSwitcher from "./components/dev/DevModeSwitcher";
import { DevToolsPanel } from "./components/dev/DevToolsPanel";
import { PerformanceMonitor } from "./components/dev/PerformanceMonitor-Draggable";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useDevTools } from "./hooks/useDevTools";
import { useTheme } from "./hooks/useTheme";
import { testDatabaseConnection } from "./lib/database-helpers";
import { AppRouter } from "./routes/AppRouter";
import { initWebVitals } from "./utils/performance/webVitals";

/**
 * App Component
 *
 * Main application component with routing, error boundaries, and initialization.
 * Now uses React Router for multi-page navigation with authentication.
 */
function App() {
  // Initialize theme system
  useTheme();

  // Initialize dev tools
  const devTools = useDevTools();

  // Test database connection on app start
  useEffect(() => {
    const initBoxCall = async () => {
      console.log("BoxCall: Initializing application...");

      // Initialize performance monitoring
      initWebVitals();

      const connectionOk = await testDatabaseConnection();
      if (connectionOk) {
        console.log("BoxCall: Database connected successfully!");
      } else {
        console.log(
          "BoxCall: Database connection failed - check your .env.local configuration"
        );
      }
    };

    initBoxCall();
  }, []);

  return (
    <ErrorBoundary>
      <DevModeProvider>
        <div className="App">
          <DevHealthCheck />
          <AppRouter />
          <DevModeSwitcher />

          {/* Development Tools - Super Admin Mode */}
          {process.env.NODE_ENV === "development" && (
            <>
              {devTools.showDevPanel && (
                <DevToolsPanel
                  onTogglePerformance={devTools.togglePerformanceMonitor}
                  onOpenStorybook={devTools.openStorybook}
                  onOpenBundleAnalyzer={devTools.openBundleAnalyzer}
                />
              )}
              {devTools.showPerformanceMonitor && <PerformanceMonitor />}
            </>
          )}
        </div>
      </DevModeProvider>
    </ErrorBoundary>
  );
}

export default App;
