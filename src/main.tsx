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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
