import type { ThemeDefinition } from "./types";
import { colorTokens } from "../design-system/tokens";

const lightTheme: ThemeDefinition = {
  id: "light",
  label: "Light",
  version: 1,
  mode: "light",
  semantic: {
    primary: "#00A86B",
    primaryHover: colorTokens.emerald[700],
    primaryActive: colorTokens.emerald[800],
    textPrimary: colorTokens.gray[900],
    textSecondary: colorTokens.gray[600],
    textMuted: colorTokens.gray[500],
    textInverse: "#ffffff",
    textBrand: colorTokens.emerald[700],
    bgPrimary: "#ffffff",
    bgSecondary: colorTokens.gray[50],
    bgMuted: colorTokens.gray[100],
    surfaceSubtleHover: colorTokens.gray[100],
    surfaceInverse: colorTokens.gray[900],
    surfaceInverseAlt: colorTokens.gray[700],
    border: colorTokens.gray[200],
    borderFocus: "#00A86B",
    borderError: colorTokens.red[500],
    focusRing: colorTokens.emerald[700],
    success: colorTokens.emerald[500],
    successBg: "#F0FDF4",
    warning: colorTokens.amber[500],
    warningBg: colorTokens.amber[50],
    error: colorTokens.red[500],
    errorBg: colorTokens.red[50],
  },
  description: "Default light theme.",
};

export default lightTheme;
