// Dynamic theme loader for lazy-loading theme definitions
import { warn } from "../utils/logger";
async function loadTheme(
  name: ThemeName
): Promise<import("./types").ThemeDefinition | undefined> {
  switch (name) {
    case "light":
      return (await import("./light")).default;
    case "dark":
      return (await import("./dark")).default;
    case "high-contrast":
      return (await import("./highContrast")).default;
    default:
      // Unknown theme, return light as fallback
      warn(`Unknown theme "${name}", falling back to light theme`);
      return (await import("./light")).default;
  }
}

const THEME_STORAGE_KEY = "app-theme";
// Explicit theme id union (only active themes)
export const THEME_IDS = ["light", "dark", "high-contrast"] as const;
export type ThemeName = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeName = "light";

export function getStoredTheme(): ThemeName | null {
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  if (!v) return null;
  return (THEME_IDS as readonly string[]).includes(v) ? (v as ThemeName) : null;
}

export async function applyTheme(name: ThemeName) {
  const theme = await loadTheme(name);
  if (!theme) return;
  const root = document.documentElement;
  root.setAttribute("data-theme", name);
  if (name === "dark" || name === "high-contrast") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.classList.remove("high-contrast");
  if (name === "high-contrast") root.classList.add("high-contrast");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
}

export async function initTheme(fallback: ThemeName = DEFAULT_THEME) {
  const stored = getStoredTheme();
  await applyTheme(stored ?? fallback);
}

// Optional immediate hydration (call at app entry before React mounts)
if (typeof document !== "undefined") {
  queueMicrotask(async () => {
    if (!document.documentElement.getAttribute("data-theme")) {
      const stored = getStoredTheme();
      await applyTheme((stored as ThemeName) ?? DEFAULT_THEME);
    }
  });
}
