import type { ThemeDefinition, ThemeRegistryExport } from "./types";

// Base (light) theme derived from existing semantic tokens in tokens.ts
export const lightTheme: ThemeDefinition = {
  id: "light",
  label: "Light",
  version: 1,
  mode: "light",
  semantic: {
    primary: "#00A86B",
    primaryHover: "#047857",
    primaryActive: "#065F46",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    textInverse: "#FFFFFF",
    textBrand: "#047857",
    bgPrimary: "#FFFFFF",
    bgSecondary: "#F9FAFB",
    bgMuted: "#F3F4F6",
    surfaceSubtleHover: "#F3F4F6",
    surfaceInverse: "#111827",
    surfaceInverseAlt: "#374151",
    border: "#E5E7EB",
    borderFocus: "#00A86B",
    borderError: "#EF4444",
    focusRing: "#047857",
    success: "#22C55E",
    successBg: "#F0FDF4",
    warning: "#F59E0B",
    warningBg: "#FFFBEB",
    error: "#EF4444",
    errorBg: "#FEF2F2",
  },
  description: "Default light theme.",
};

export const darkTheme: ThemeDefinition = {
  id: "dark",
  label: "Dark",
  version: 1,
  mode: "dark",
  semantic: {
    primary: "#00A86B",
    primaryHover: "#34D399", // slightly lighter hover in dark
    primaryActive: "#047857",
    textPrimary: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textMuted: "#9CA3AF",
    textInverse: "#111827",
    textBrand: "#34D399",
    bgPrimary: "#111827",
    bgSecondary: "#1F2937",
    bgMuted: "#374151",
    surfaceSubtleHover: "rgba(55,65,81,0.85)",
    surfaceInverse: "#374151",
    surfaceInverseAlt: "#4B5563",
    border: "#374151",
    borderFocus: "#00A86B",
    borderError: "#F87171",
    focusRing: "#00A86B",
    success: "#22C55E",
    successBg: "#064E3B",
    warning: "#F59E0B",
    warningBg: "#78350F",
    error: "#EF4444",
    errorBg: "#7F1D1D",
  },
  description: "Dark theme tuned for contrast.",
};

export const highContrastTheme: ThemeDefinition = {
  id: "high-contrast",
  label: "High Contrast",
  version: 1,
  mode: "high-contrast",
  semantic: {
    primary: "#065F46",
    primaryHover: "#00A86B",
    primaryActive: "#047857",
    textPrimary: "#000000",
    textSecondary: "#111827",
    textMuted: "#1F2937",
    textInverse: "#FFFFFF",
    textBrand: "#065F46",
    bgPrimary: "#FFFFFF",
    bgSecondary: "#F3F4F6",
    bgMuted: "#E5E7EB",
    surfaceSubtleHover: "#D1D5DB",
    surfaceInverse: "#000000",
    surfaceInverseAlt: "#111827",
    border: "#111827",
    borderFocus: "#065F46",
    borderError: "#B91C1C",
    focusRing: "#065F46",
    success: "#166534",
    successBg: "#BBF7D0",
    warning: "#B45309",
    warningBg: "#FDE68A",
    error: "#B91C1C",
    errorBg: "#FECACA",
  },
  description: "High contrast variant for accessibility / visual clarity.",
};

export const themeRegistry: ThemeRegistryExport = {
  themes: [lightTheme, darkTheme, highContrastTheme],
  baseId: "light",
};

export function getTheme(id: string) {
  return themeRegistry.themes.find((t) => t.id === id);
}
