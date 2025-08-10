import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppProviders } from "./app/providers.tsx";
import "./index.css";
import "./styles/responsive-dashboard.css";
import "./styles/density.css";
// Development-only contrast debugging overlay (activated via localStorage 'debugContrast')
import "./dev/contrastDebug";

// Web Vitals monitoring for production
if (process.env.NODE_ENV === "production") {
  import("web-vitals").then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log);
    onINP(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
