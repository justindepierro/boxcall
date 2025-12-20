import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppProviders } from "./app/providers.tsx";

// Inject build metadata (defined at build time via Vite)
declare const __BUILD_TIME__: string;
window.__BUILD_META__ = {
  buildTime:
    typeof __BUILD_TIME__ !== "undefined"
      ? __BUILD_TIME__
      : new Date().toISOString(),
  mode: import.meta.env.MODE,
};
import "./index.css";
import "./styles/responsive-dashboard.css";
import "./styles/density.css";
// Development-only contrast debugging overlay (activated via localStorage 'debugContrast')
if (import.meta.env.DEV) {
  let shouldLoad = false;
  try {
    shouldLoad = localStorage.getItem("debugContrast") === "on";
  } catch {
    // Ignore storage access failures (private mode, blocked, etc.)
  }

  if (shouldLoad) {
    import("./dev/contrastDebug").catch(() => {
      /* noop */
    });
  }
}
import { initWebVitals } from "./telemetry/initWebVitals";
if (import.meta.env.PROD) initWebVitals();
// Opportunistic route prefetch (opt-in via env)
import { initRoutePrefetch } from "./routes/prefetch";
if (import.meta.env.VITE_PREFETCH_ROUTES === "true") {
  // Run after next tick to avoid competing with initial render
  setTimeout(() => initRoutePrefetch(), 0);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
