import type { ThemeDefinition } from "./types";
import { colorTokens } from "../design-system/tokens";

const darkTheme: ThemeDefinition = {
  id: "dark",
  label: "Dark",
  version: 1,
  mode: "dark",
  semantic: {
    primary: "#00A86B",
    primaryHover: colorTokens.emerald[400],
    primaryActive: colorTokens.emerald[700],
    textPrimary: colorTokens.gray[50],
    textSecondary: colorTokens.gray[300],
    textMuted: colorTokens.gray[400],
    textInverse: colorTokens.gray[900],
    textBrand: colorTokens.emerald[400],
    bgPrimary: colorTokens.gray[900],
    bgSecondary: colorTokens.gray[800],
    bgMuted: colorTokens.gray[700],
    surfaceSubtleHover: "rgba(55,65,81,0.85)",
    surfaceInverse: colorTokens.gray[700],
    surfaceInverseAlt: colorTokens.gray[600],
    border: colorTokens.gray[700],
    borderFocus: "#00A86B",
    borderError: colorTokens.red[400],
    focusRing: "#00A86B",
    success: colorTokens.emerald[500],
    successBg: colorTokens.emerald[900],
    warning: colorTokens.amber[500],
    warningBg: "#78350F",
    error: colorTokens.red[500],
    errorBg: "#7F1D1D",
  },
  description: "Dark theme tuned for contrast.",
};

export default darkTheme;
