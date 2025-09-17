import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppProviders } from "./app/providers.tsx";
// Inject build metadata (defined at build time via Vite)
declare const __BUILD_TIME__: string;
window.__BUILD_META__ = {
  buildTime: __BUILD_TIME__,
  mode: import.meta.env.MODE,
};
import "./index.css";
import "./styles/responsive-dashboard.css";
import "./styles/density.css";
// Development-only contrast debugging overlay (activated via localStorage 'debugContrast')
import "./dev/contrastDebug";
import { initWebVitals } from "./telemetry/initWebVitals";
if (process.env.NODE_ENV === "production") initWebVitals();
// Opportunistic route prefetch (opt-in via env)
import { initRoutePrefetch } from "./routes/prefetch";
if (import.meta.env.VITE_PREFETCH_ROUTES === "true") {
  // Run after next tick to avoid competing with initial render
  setTimeout(() => initRoutePrefetch(), 0);
}

// Optional: enable icon debug logs if requested
try {
  if (localStorage.getItem("debugIcons") === "1") {
    // @ts-expect-error custom flag on window
    window.__ICON_DEBUG__ = true;
    console.info("[IconDebug] Icon debug mode enabled via localStorage");
  } else {
    // Provide a clear hint once at startup
    console.info(
      "[IconDebug] To enable icon debug logs, run: localStorage.setItem('debugIcons','1'); location.reload()"
    );
  }
} catch {
  // ignore storage access issues
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
