export interface SemanticTheme {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textBrand: string;
  bgPrimary: string;
  bgSecondary: string;
  bgMuted: string;
  surfaceSubtleHover: string;
  surfaceInverse: string;
  surfaceInverseAlt: string;
  border: string;
  borderFocus: string;
  borderError: string;
  focusRing: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  [key: string]: string; // allow indexed semantic lookups in tooling scripts
}

export interface ThemeDefinition {
  id: string;
  label: string;
  version: number;
  mode: "light" | "dark" | "high-contrast";
  semantic: SemanticTheme;
  component?: Record<string, Record<string, string>>; // optional component-level tokens
  description?: string;
}

export interface ThemeRegistryExport {
  themes: ThemeDefinition[];
  baseId: string; // id considered the fallback/base (light)
}
