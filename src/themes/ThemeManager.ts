import { getTheme } from "./registry";

const THEME_STORAGE_KEY = "app-theme";
// Explicit theme id union (keep in sync with registry contents)
export const THEME_IDS = ["light", "dark", "high-contrast"] as const;
export type ThemeName = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeName = "light";

export function getStoredTheme(): ThemeName | null {
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  if (!v) return null;
  return (THEME_IDS as readonly string[]).includes(v) ? (v as ThemeName) : null;
}

export function applyTheme(name: ThemeName) {
  const theme = getTheme(name);
  if (!theme) return;
  const root = document.documentElement;
  // Data attribute for CSS variable scoping
  root.setAttribute("data-theme", name);
  // Legacy Tailwind dark variant support (many classes still rely on .dark)
  // We treat both dark + high-contrast as dark base until full variable migration.
  if (name === "dark" || name === "high-contrast") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  // Optional high-contrast class for future specific overrides
  root.classList.remove("high-contrast");
  if (name === "high-contrast") root.classList.add("high-contrast");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
}

export function initTheme(fallback: ThemeName = DEFAULT_THEME) {
  const stored = getStoredTheme();
  applyTheme(stored ?? fallback);
}

// Optional immediate hydration (call at app entry before React mounts)
if (typeof document !== "undefined") {
  // Defer to next microtask to allow other early scripts to run
  queueMicrotask(() => {
    if (!document.documentElement.getAttribute("data-theme")) {
      const stored = getStoredTheme();
      applyTheme((stored as ThemeName) ?? DEFAULT_THEME);
    }
  });
}
