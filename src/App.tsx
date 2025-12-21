import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "sonner";

import { DevModeProvider } from "./app/dev-mode-store.tsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AuthGuard } from "./components/auth/AuthGuard";
import { useTheme } from "./hooks/useTheme";
import { initRoutePrefetch } from "./routes/prefetch";
import { DataRouterApp } from "./routes";
import { AppGrid } from "./components/AppGrid";
import { PWAIntegration } from "./components/pwa/PWAIntegration";
import {
  AnalyticsProvider,
} from "./telemetry/AnalyticsProvider";
import { AppProvider } from "./components/core";
import { SaveStateProvider } from "./contexts/SaveStateContext";
import { useSaveState } from "./hooks/useSaveState";
import { UndoRedoProvider } from "./contexts/UndoRedoContext";
import { PopoverProvider } from "./contexts/PopoverContext";
import { PendingSavesNotification } from "./components/notifications/PendingSavesNotification";
import { UndoRedoIndicator } from "./components/undo/UndoRedoIndicator";
import { ConflictDialog } from "./components/conflicts/ConflictDialog";
import { OfflineIndicator } from "./components/ui/OfflineIndicator";
import { APP_RESET_EVENT } from "./utils/appReset";
import {
  DEV_PANEL_CONTROL_EVENT,
  type DevPanelControlDetail,
} from "./utils/devPanelControl";

type DevPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DevHealthCheckLazy = import.meta.env.DEV
  ? lazy(() =>
      import("./components/ui/DevHealthCheck").then((mod) => ({
        default: mod.DevHealthCheck,
      }))
    )
  : null;

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
  const [appResetKey, setAppResetKey] = useState(0);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [DevPanelComponent, setDevPanelComponent] =
    useState<React.ComponentType<DevPanelProps> | null>(null);

  // Initialize theme system
  useTheme();

  // Test database connection on app start (dev only)
  useEffect(() => {
    const initBoxCall = async () => {
      if (import.meta.env.DEV) {
        // Lazy-import dev-only diagnostic function
        const { testBasicDatabaseConnectivity } = await import(
          "./lib/database-helpers"
        );
        const { logError } = await import("./utils/logger");
        const connectionOk = await testBasicDatabaseConnectivity();
        if (!connectionOk) {
          logError(
            "BoxCall: Database connection failed - check your .env.local configuration"
          );
        }
      }
      // Initialize idle prefetching for popular routes
      initRoutePrefetch();
    };
    initBoxCall();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail;
      if (detail?.reason) {
        // keep this low-noise; logger already DEV-gated elsewhere
      }
      setShowDevPanel(false);
      setDevPanelComponent(null);
      setAppResetKey((k) => k + 1);
    };

    window.addEventListener(APP_RESET_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(APP_RESET_EVENT, handler as EventListener);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<DevPanelControlDetail>).detail;
      if (!detail?.action) return;

      setShowDevPanel((prev) => {
        switch (detail.action) {
          case "open":
            return true;
          case "close":
            return false;
          case "toggle":
          default:
            return !prev;
        }
      });
    };

    window.addEventListener(DEV_PANEL_CONTROL_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(
        DEV_PANEL_CONTROL_EVENT,
        handler as EventListener
      );
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!showDevPanel) return;
    if (DevPanelComponent) return;

    let mounted = true;
    void import("./components/dev/DevPanel").then((mod) => {
      if (!mounted) return;
      setDevPanelComponent(() => mod.default);
    });

    return () => {
      mounted = false;
    };
  }, [showDevPanel, DevPanelComponent]);

  return (
    <ErrorBoundary key={appResetKey}>
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
                    {import.meta.env.DEV && DevHealthCheckLazy ? (
                      <Suspense fallback={null}>
                        <DevHealthCheckLazy />
                      </Suspense>
                    ) : null}
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
                    {import.meta.env.DEV && DevPanelComponent ? (
                      <DevPanelComponent
                        isOpen={showDevPanel}
                        onClose={() => setShowDevPanel(false)}
                      />
                    ) : null}

                    {/* DevPanel hotkey: ctrl+shift+D to show/hide DevPanel for authorized users */}
                    {import.meta.env.DEV ? (
                      <ToggleDevPanel
                        onToggle={() => setShowDevPanel((v) => !v)}
                      />
                    ) : null}

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
    if (!import.meta.env.DEV) return;

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
