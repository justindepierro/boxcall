import { useEffect, useState } from "react";

import { DevModeProvider } from "./app/dev-mode-store.tsx";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AuthGuard } from "./components/auth/AuthGuard";
import { useTheme } from "./hooks/useTheme";
import { useSessionMonitor } from "./hooks/useSessionMonitor";
import { testBasicDatabaseConnectivity } from "./lib/database-helpers";
import { initRoutePrefetch } from "./routes/prefetch";
import { DataRouterApp } from "./routes";
import { AppGrid } from "./components/AppGrid";
import { PWAIntegration } from "./components/pwa/PWAIntegration";
import {
  AnalyticsProvider,
  AnalyticsDebugger,
} from "./components/analytics/AnalyticsProvider";
import { AppProvider } from "./components/core";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import DevPanel from "./components/dev/DevPanel";
/**
 * App Component
 *
 * Main application component with routing, error boundaries, and initialization.
 * Now uses React Router for multi-page navigation with authentication.
 */
function App() {
  const [showRQDevtools, setShowRQDevtools] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  
  // Initialize theme system
  useTheme();
  
  // Monitor session and auto-refresh
  useSessionMonitor();

  // Test database connection on app start
  useEffect(() => {
    const initBoxCall = async () => {
      const connectionOk = await testBasicDatabaseConnectivity();
      if (connectionOk) {
        // Connection successful
      } else {
        console.error(
          "BoxCall: Database connection failed - check your .env.local configuration"
        );
      }
      // Initialize idle prefetching for popular routes
      initRoutePrefetch();
    };
    initBoxCall();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider
        enableDevTools={import.meta.env.DEV}
        enableShowcase={import.meta.env.DEV}
        enableCSRF={true}
        enableSessionSecurity={true}
      >
        <AnalyticsProvider>
          <DevModeProvider>
            <div className="App">
              <DevHealthCheck />
              <AppGrid>
                <AuthGuard>
                  <DataRouterApp />
                </AuthGuard>
              </AppGrid>
              <PWAIntegration />
              {showRQDevtools && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
              )}
              <DevPanel
                isOpen={showDevPanel}
                onClose={() => setShowDevPanel(false)}
              />
              {/* Simple keyboard toggle: ctrl+` to show/hide React Query Devtools in dev */}
              {import.meta.env.DEV && (
                <ToggleQueryDevtools
                  onToggle={() => setShowRQDevtools((v) => !v)}
                />
              )}
              {/* DevPanel hotkey: ctrl+shift+D to show/hide DevPanel for authorized users */}
              <ToggleDevPanel onToggle={() => setShowDevPanel((v) => !v)} />

              {/* Analytics Debug Panel (dev only) */}
              <AnalyticsDebugger />
            </div>
          </DevModeProvider>
        </AnalyticsProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

function ToggleQueryDevtools({ onToggle }: { onToggle: () => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        onToggle();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggle]);
  return null;
}

function ToggleDevPanel({ onToggle }: { onToggle: () => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        onToggle();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggle]);
  return null;
}
export default App;
