import type { ThemeDefinition } from "./types";
import { colorTokens } from "../design-system/tokens";

const highContrastTheme: ThemeDefinition = {
  id: "high-contrast",
  label: "High Contrast",
  version: 1,
  mode: "high-contrast",
  semantic: {
    primary: colorTokens.emerald[800],
    primaryHover: "#00A86B",
    primaryActive: colorTokens.emerald[700],
    textPrimary: "#000000",
    textSecondary: colorTokens.gray[900],
    textMuted: colorTokens.gray[800],
    textInverse: "#ffffff",
    textBrand: colorTokens.emerald[800],
    bgPrimary: "#ffffff",
    bgSecondary: colorTokens.gray[100],
    bgMuted: colorTokens.gray[200],
    surfaceSubtleHover: colorTokens.gray[300],
    surfaceInverse: "#000000",
    surfaceInverseAlt: colorTokens.gray[900],
    border: colorTokens.gray[900],
    borderFocus: colorTokens.emerald[800],
    borderError: colorTokens.red[700],
    focusRing: colorTokens.emerald[800],
    success: "#166534",
    successBg: "#BBF7D0",
    warning: colorTokens.amber[700],
    warningBg: colorTokens.amber[200],
    error: colorTokens.red[700],
    errorBg: colorTokens.red[200],
  },
  description: "High contrast theme.",
};

export default highContrastTheme;
