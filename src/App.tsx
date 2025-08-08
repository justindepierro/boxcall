import { useEffect } from "react";
import "./App.css";
import { DevModeProvider } from "./app/dev-mode-store.tsx";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
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
    };
    initBoxCall();
  }, []);

  return (
    <ErrorBoundary>
      <DevModeProvider>
        <div className="App">
          <DevHealthCheck />
          <AppRouter />
        </div>
      </DevModeProvider>
    </ErrorBoundary>
  );
}
export default App;
