import type { ThemeDefinition } from "./types";

const lightTheme: ThemeDefinition = {
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

export default lightTheme;
