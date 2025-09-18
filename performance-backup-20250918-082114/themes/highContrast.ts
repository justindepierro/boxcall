import type { ThemeDefinition } from "./types";

const highContrastTheme: ThemeDefinition = {
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
  description: "High contrast theme.",
};

export default highContrastTheme;
