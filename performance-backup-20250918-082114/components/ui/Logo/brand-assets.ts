/**
 * Brand Assets Configuration
 *
 * Central configuration for all BoxCall brand assets including logos,
 * colors, and usage guidelines for professional consistency
 */

// Logo asset paths (relative to public directory)
export const BRAND_ASSETS = {
  logos: {
    icon: {
      svg: "/src/assets/brand/boxcall-logo.svg",
      // TODO: Add additional formats
      // png: "/src/assets/brand/boxcall-logo.png",
      // webp: "/src/assets/brand/boxcall-logo.webp",
    },
    full: {
      svg: "/src/assets/brand/boxcall-logo-with-text.svg",
      // TODO: Add additional formats
      // png: "/src/assets/brand/boxcall-logo-with-text.png",
      // webp: "/src/assets/brand/boxcall-logo-with-text.webp",
    },
  },

  // Brand colors (matches design system)
  colors: {
    primary: "#059669", // jade-600 - main brand color
    primaryDark: "#047857", // jade-700 - darker variant
    primaryLight: "#10b981", // jade-500 - lighter variant

    // Contrast colors for different backgrounds
    onLight: "#059669", // Use brand green on light backgrounds
    onDark: "#ffffff", // Use white on dark backgrounds
    onBrand: "#ffffff", // Use white on brand color backgrounds
  },

  // Usage contexts and their optimal configurations
  contexts: {
    navbar: {
      variant: "icon" as const,
      size: "md" as const,
      color: "brand" as const,
    },
    sidebar: {
      variant: "icon" as const,
      size: "sm" as const,
      color: "brand" as const,
    },
    auth: {
      variant: "full" as const,
      size: "lg" as const,
      color: "brand" as const,
    },
    hero: {
      variant: "full" as const,
      size: "xl" as const,
      color: "brand" as const,
    },
    favicon: {
      variant: "icon" as const,
      size: "xs" as const,
      color: "brand" as const,
    },
    splash: {
      variant: "full" as const,
      size: "2xl" as const,
      color: "brand" as const,
    },
  },
} as const;

// Logo usage guidelines
export const LOGO_GUIDELINES = {
  // Minimum sizes to maintain legibility
  minSizes: {
    icon: 16, // px
    full: 100, // px
  },

  // Recommended clear space (as multiple of logo height)
  clearSpace: {
    minimum: 0.5, // Half the logo height around all sides
    optimal: 1.0, // Full logo height for premium feel
  },

  // When to use each variant
  usage: {
    icon: [
      "Navigation bars",
      "Favicons",
      "App icons",
      "Small UI elements",
      "When space is limited",
    ],
    full: [
      "Authentication forms",
      "Headers and hero sections",
      "Marketing materials",
      "Email signatures",
      "When brand recognition is priority",
    ],
  },

  // Color usage by context
  colorUsage: {
    brand: "Primary brand color - use on light backgrounds",
    white: "Use on dark or brand-colored backgrounds",
    black: "Use for print materials or high contrast needs",
    current: "Inherit color from parent element",
  },
} as const;

// Helper functions for brand asset management
export const getBrandAsset = (
  variant: "icon" | "full",
  format: "svg" = "svg"
) => {
  return BRAND_ASSETS.logos[variant][format];
};

export const getContextualLogo = (
  context: keyof typeof BRAND_ASSETS.contexts
) => {
  return BRAND_ASSETS.contexts[context];
};

export const validateLogoSize = (
  size: number,
  variant: "icon" | "full"
): boolean => {
  return size >= LOGO_GUIDELINES.minSizes[variant];
};

export default BRAND_ASSETS;
