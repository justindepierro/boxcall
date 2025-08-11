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
import { trackVital } from "./telemetry/vitals";
import { TelemetryEventTypes } from "./telemetry/events";

// Web Vitals monitoring for production
if (process.env.NODE_ENV === "production") {
  import("web-vitals").then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    const wrap =
      (eventType: string) =>
      (metric: { name: string; value: number; id: string }) => {
        trackVital(eventType, metric.value, { id: metric.id });
      };
    onCLS(wrap(TelemetryEventTypes.VitalCLS));
    onINP(wrap(TelemetryEventTypes.VitalINP));
    onFCP(wrap(TelemetryEventTypes.VitalFCP));
    onLCP(wrap(TelemetryEventTypes.VitalLCP));
    onTTFB(wrap(TelemetryEventTypes.VitalTTFB));
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
