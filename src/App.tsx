import { useEffect } from "react";
import "./App.css";
import { AppRouter } from "./routes/AppRouter";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { DevHealthCheck } from "./components/ui/DevHealthCheck";
import { testDatabaseConnection } from "./lib/database-helpers";

/**
 * App Component
 * 
 * Main application component with routing, error boundaries, and initialization.
 * Now uses React Router for multi-page navigation with authentication.
 */
function App() {
  // Test database connection on app start
  useEffect(() => {
    const initBoxCall = async () => {
      console.log("🚀 Initializing BoxCall application...");

      const connectionOk = await testDatabaseConnection();
      if (connectionOk) {
        console.log("✅ BoxCall database connected successfully!");
      } else {
        console.log(
          "❌ Database connection failed - check your .env.local configuration"
        );
      }
    };

    initBoxCall();
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <DevHealthCheck />
        <AppRouter />
      </div>
    </ErrorBoundary>
  );
}

export default App;
