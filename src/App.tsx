import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { DevModeProvider } from "./app/dev-mode-store.tsx";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AuthGuard } from "./components/auth/AuthGuard";
import { useTheme } from "./hooks/useTheme";
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
import { SaveStateProvider } from "./contexts/SaveStateContext";
import { useSaveState } from "./hooks/useSaveState";
import { UndoRedoProvider } from "./contexts/UndoRedoContext";
import { PopoverProvider } from "./contexts/PopoverContext";
import { PendingSavesNotification } from "./components/notifications/PendingSavesNotification";
import { UndoRedoIndicator } from "./components/undo/UndoRedoIndicator";
import { ConflictDialog } from "./components/conflicts/ConflictDialog";
import DevPanel from "./components/dev/DevPanel";
import { OfflineIndicator } from "./components/ui/OfflineIndicator";
import { logError } from "./utils/logger";

/**
 * ConflictOverlay - Shows conflict dialog when there's an active conflict
 */
function ConflictOverlay() {
  const { activeConflict } = useSaveState();

  if (!activeConflict) return null;

  return <ConflictDialog conflict={activeConflict} />;
}

/**
 * App Component
 *
 * Main application component with routing, error boundaries, and initialization.
 * Now uses React Router for multi-page navigation with authentication.
 */
function App() {
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Initialize theme system
  useTheme();

  // Test database connection on app start
  useEffect(() => {
    const initBoxCall = async () => {
      const connectionOk = await testBasicDatabaseConnectivity();
      if (connectionOk) {
        // Connection successful
      } else {
        logError(
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
            <SaveStateProvider>
              <UndoRedoProvider maxHistorySize={50}>
                <PopoverProvider>
                  <div className="App">
                    <Toaster position="top-right" richColors />
                    <DevHealthCheck />
                    <PendingSavesNotification />
                    <UndoRedoIndicator />
                    <ConflictOverlay />
                    <AppGrid>
                      <AuthGuard>
                        <DataRouterApp />
                      </AuthGuard>
                    </AppGrid>
                    <PWAIntegration />
                    <OfflineIndicator />
                    <DevPanel
                      isOpen={showDevPanel}
                      onClose={() => setShowDevPanel(false)}
                    />
                    {/* DevPanel hotkey: ctrl+shift+D to show/hide DevPanel for authorized users */}
                    <ToggleDevPanel
                      onToggle={() => setShowDevPanel((v) => !v)}
                    />

                    {/* Analytics Debug Panel (dev only) */}
                    <AnalyticsDebugger />
                  </div>
                </PopoverProvider>
              </UndoRedoProvider>
            </SaveStateProvider>
          </DevModeProvider>
        </AnalyticsProvider>
      </AppProvider>
    </ErrorBoundary>
  );
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
