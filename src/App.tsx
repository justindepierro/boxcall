import { useEffect, useState } from "react";

import "./App.css";
import { DevModeProvider } from "./app/dev-mode-store.tsx";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useTheme } from "./hooks/useTheme";
import { testDatabaseConnection } from "./lib/database-helpers";
import { initRoutePrefetch } from "./routes/prefetch";
import { DataRouterApp } from "./routes";
import { AppGrid } from "./components/AppGrid";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { initWebVitals } from "./utils/performance/webVitals";
/**
 * App Component
 *
 * Main application component with routing, error boundaries, and initialization.
 * Now uses React Router for multi-page navigation with authentication.
 */
function App() {
  const [showRQDevtools, setShowRQDevtools] = useState(false);
  // Initialize theme system
  useTheme();

  // Test database connection on app start
  useEffect(() => {
    const initBoxCall = async () => {
      // Initialize performance monitoring
      initWebVitals();
      const connectionOk = await testDatabaseConnection();
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
      <DevModeProvider>
        <div className="App">
          <DevHealthCheck />
          <AppGrid>
            <DataRouterApp />
          </AppGrid>
          {showRQDevtools && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
          {/* Simple keyboard toggle: ctrl+` to show/hide React Query Devtools in dev */}
          {import.meta.env.DEV && (
            <ToggleQueryDevtools
              onToggle={() => setShowRQDevtools((v) => !v)}
            />
          )}
        </div>
      </DevModeProvider>
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
export default App;
