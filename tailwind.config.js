/** @type {import('tailwindcss').Config} */
// Import design tokens for centralized color management
const auroraTheme = require("./src/styles/tailwind/auroraTheme");
const designTokens = {
  jade: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399", // Enhanced for dark mode readability
    500: "#00A86B", // PRIMARY brand color
    600: "#047857", // MAIN interaction color (hover, focus, icons)
    700: "#065F46",
    800: "#064E3B",
    900: "#052E16",
  },
  navy: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
  electric: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6", // Primary electric purple
    600: "#7C3AED", // Main accent color (CTAs, highlights)
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
  },
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E", // Primary success
    600: "#16A34A", // Main success (buttons, icons)
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // Primary warning
    600: "#D97706", // Main warning (buttons, icons)
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444", // Primary error
    600: "#DC2626", // Main error (buttons, icons)
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // Primary info
    600: "#2563EB", // Main info (buttons, icons)
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  // Advanced Color Harmonies - Mathematical color relationships
  harmony: {
    // Complementary colors (opposite on color wheel)
    complementary: {
      jade: "#00A86B", // Primary
      electric: "#7C3AED", // Complementary
      coral: "#FF6B6B", // Warm accent
    },
    // Triadic colors (equally spaced on color wheel)
    triadic: {
      jade: "#00A86B", // Primary
      electric: "#7C3AED", // Triadic 1
      coral: "#FF6B6B", // Triadic 2
    },
    // Analogous colors (adjacent on color wheel)
    analogous: {
      sage: "#7CB342", // Cool green
      jade: "#00A86B", // Primary
      teal: "#009688", // Cool teal
    },
  },

  // Contextual Color Schemes - Different palettes for different app contexts
  context: {
    // Calm, professional palette for admin/dashboard areas
    calm: {
      primary: "#00A86B", // Jade
      secondary: "#475569", // Navy
      accent: "#7C3AED", // Electric
      background: "#F8FAFC",
      surface: "#FFFFFF",
    },
    // Energetic palette for game planning and strategy
    energetic: {
      primary: "#7C3AED", // Electric
      secondary: "#00A86B", // Jade
      accent: "#FF6B6B", // Coral
      background: "#FEF7FF",
      surface: "#FFFFFF",
    },
    // Professional palette for team management
    professional: {
      primary: "#1E293B", // Navy
      secondary: "#00A86B", // Jade
      accent: "#F59E0B", // Amber
      background: "#F8FAFC",
      surface: "#FFFFFF",
    },
  },

  // Advanced Accessibility Colors - WCAG 2.1 AA compliant
  accessibility: {
    // High contrast mode colors
    highContrast: {
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#000000",
      border: "#000000",
      focus: "#000000",
      primary: "#000000",
      secondary: "#404040",
    },
    // Color blindness friendly palettes
    deuteranopia: {
      // Red-green color blindness
      success: "#007ACC", // Blue instead of green
      error: "#FF6B6B", // Red (still visible)
      warning: "#FF9500", // Orange
      info: "#5856D6", // Purple
    },
    protanopia: {
      // Red color blindness
      success: "#007ACC", // Blue instead of green
      error: "#8E8E93", // Gray instead of red
      warning: "#FF9500", // Orange
      info: "#5856D6", // Purple
    },
    tritanopia: {
      // Blue color blindness
      success: "#30D158", // Green
      error: "#FF453A", // Red
      warning: "#FF9F0A", // Orange
      info: "#BF5AF2", // Purple
    },
  },

  // Dynamic Team Color Generation - AI-powered palette creation
  team: {
    // Base team colors that can be customized
    primary: "#00A86B", // Default jade
    secondary: "#1E293B", // Default navy
    accent: "#7C3AED", // Default electric

    // Generated harmonious variations
    variants: {
      light: "#ECFDF5", // Light tint
      dark: "#052E16", // Dark shade
      muted: "#A7F3D0", // Muted version
      vibrant: "#00D4AA", // More vibrant
    },

    // Team-specific color schemes
    schemes: {
      classic: {
        // Traditional team colors
        primary: "#00A86B",
        secondary: "#1E293B",
        accent: "#7C3AED",
      },
      modern: {
        // Contemporary palette
        primary: "#7C3AED",
        secondary: "#00A86B",
        accent: "#FF6B6B",
      },
      minimal: {
        // Clean, minimal approach
        primary: "#1E293B",
        secondary: "#64748B",
        accent: "#F1F5F9",
      },
    },
  },
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Centralized design tokens - single source of truth
        jade: designTokens.jade,
        navy: designTokens.navy,
        gray: designTokens.gray,
        success: designTokens.success,
        warning: designTokens.warning,
        error: designTokens.error,
        electric: designTokens.electric,

        // Enhanced dark mode color system
        dark: designTokens.dark,

        // Advanced Color Harmonies
        harmony: designTokens.harmony,

        // Contextual Color Schemes
        context: designTokens.context,

        // Color Psychology System
        emotion: designTokens.emotion,

        // Advanced Accessibility Colors
        accessibility: designTokens.accessibility,

        // Dynamic Team Color System
        team: designTokens.team,

        // ============================================
        // SEMANTIC COLOR SYSTEM - Phase 3 Design System
        // ============================================
        // These map to CSS custom properties for consistent theming
        brand: {
          primary: "var(--color-brand-primary)",
          "primary-hover": "var(--color-brand-primary-hover)",
          "primary-active": "var(--color-brand-primary-active)",
          accent: "var(--color-brand-accent)",
          "accent-hover": "var(--color-brand-accent-hover)",
          secondary: "var(--color-brand-secondary)",
        },

        surface: {
          base: "var(--color-surface-base)",
          "base-dark": "var(--color-surface-base-dark)",
          elevated: "var(--color-surface-elevated)",
          "elevated-dark": "var(--color-surface-elevated-dark)",
          subtle: "var(--color-surface-subtle)",
          "subtle-dark": "var(--color-surface-subtle-dark)",
          muted: "var(--color-surface-muted)",
          "muted-dark": "var(--color-surface-muted-dark)",
          inverse: "var(--color-surface-inverse)",
        },

        text: {
          primary: "var(--color-text-primary)",
          "primary-dark": "var(--color-text-primary-dark)",
          secondary: "var(--color-text-secondary)",
          "secondary-dark": "var(--color-text-secondary-dark)",
          muted: "var(--color-text-muted)",
          "muted-dark": "var(--color-text-muted-dark)",
          inverse: "var(--color-text-inverse)",
          brand: "var(--color-text-brand)",
          "brand-dark": "var(--color-text-brand-dark)",
          accent: "var(--color-text-accent)",
          "accent-dark": "var(--color-text-accent-dark)",
        },

        border: {
          base: "var(--color-border-base)",
          "base-dark": "var(--color-border-base-dark)",
          subtle: "var(--color-border-subtle)",
          "subtle-dark": "var(--color-border-subtle-dark)",
          muted: "var(--color-border-muted)",
          "muted-dark": "var(--color-border-muted-dark)",
          focus: "var(--color-border-focus)",
          error: "var(--color-border-error)",
        },

        interactive: {
          primary: "var(--color-interactive-primary)",
          "primary-hover": "var(--color-interactive-primary-hover)",
          "primary-active": "var(--color-interactive-primary-active)",
          accent: "var(--color-interactive-accent)",
          "accent-hover": "var(--color-interactive-accent-hover)",
          "accent-active": "var(--color-interactive-accent-active)",
        },

        status: {
          success: "var(--color-success)",
          "success-bg": "var(--color-success-bg)",
          "success-bg-dark": "var(--color-success-bg-dark)",
          "success-text": "var(--color-success-text)",
          "success-text-dark": "var(--color-success-text-dark)",
          warning: "var(--color-warning)",
          "warning-bg": "var(--color-warning-bg)",
          "warning-bg-dark": "var(--color-warning-bg-dark)",
          "warning-text": "var(--color-warning-text)",
          "warning-text-dark": "var(--color-warning-text-dark)",
          error: "var(--color-error)",
          "error-bg": "var(--color-error-bg)",
          "error-bg-dark": "var(--color-error-bg-dark)",
          "error-text": "var(--color-error-text)",
          "error-text-dark": "var(--color-error-text-dark)",
        },

        gradient: {
          "brand-start": "var(--gradient-brand-start)",
          "brand-end": "var(--gradient-brand-end)",
          "accent-start": "var(--gradient-accent-start)",
          "accent-end": "var(--gradient-accent-end)",
          "secondary-start": "var(--gradient-secondary-start)",
          "secondary-end": "var(--gradient-secondary-end)",
          "warning-start": "var(--gradient-warning-start)",
          "warning-end": "var(--gradient-warning-end)",
        },

        // Enhanced Contrast System - "Carhartt Reliability"
        contrast: {
          // High contrast pairings for maximum readability
          "jade-on-white": "#047857", // Dark jade on white backgrounds
          "white-on-jade": "#FFFFFF", // White text on jade backgrounds
          "navy-on-light": "#0F172A", // Dark navy on light backgrounds
          "light-on-navy": "#F8FAFC", // Light text on navy backgrounds

          // Status colors with better contrast
          success: "#047857", // Darker jade for success states
          warning: "#D97706", // Amber with good contrast
          error: "#DC2626", // Red with strong contrast
          info: "#0369A1", // Blue with solid contrast

          // Dark mode variants
          "jade-on-dark": "#34D399", // Brighter jade for dark backgrounds
          "navy-on-dark": "#F1F5F9", // Light navy text on dark backgrounds
          "dark-on-navy": "#0F172A", // Dark text on navy backgrounds
        },

        // Enhanced elevation system
        elevation: {
          none: "none",
          card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          "card-hover":
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          "card-active": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          button: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          "button-hover":
            "0 2px 4px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          modal:
            "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.05)",
          dropdown:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },

        // Component-specific elevation classes
        "elevation-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "elevation-button": "0 1px 2px 0 rgb(0 0 0 / 0.05)",

        // Functional UI System - "Work Boot Aesthetic"
        functional: {
          // Neutral grays for professional UI
          slate: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B", // Primary neutral
            600: "#475569", // Secondary neutral
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          },

          // Surface colors for cards, modals, etc.
          surface: {
            primary: "#FFFFFF",
            secondary: "#F8FAFC",
            tertiary: "#F1F5F9",
            inverse: "#0F172A",
          },

          // Border system
          border: {
            light: "#E2E8F0",
            medium: "#CBD5E1",
            dark: "#94A3B8",
            strong: "#64748B",
          },

          // SEMANTIC DESIGN SYSTEM COLORS - Single Source of Truth
          // These map to CSS custom properties for runtime theming
          "text-primary": "var(--semantic-text-primary)",
          "text-secondary": "var(--semantic-text-secondary)",
          "text-muted": "var(--semantic-text-muted)",
          "text-inverse": "var(--semantic-text-inverse)",
          "text-brand": "var(--semantic-text-brand)",
          "text-accent": "var(--semantic-text-accent)",
          "text-accent-secondary": "var(--semantic-text-accent-secondary)",
          "text-accent-electric": "var(--semantic-text-accent-electric)",

          "bg-primary": "var(--semantic-bg-primary)",
          "bg-secondary": "var(--semantic-bg-secondary)",
          "bg-muted": "var(--semantic-bg-muted)",
          "surface-primary": "var(--semantic-bg-primary)",
          "surface-secondary": "var(--semantic-bg-secondary)",
          "surface-muted": "var(--semantic-bg-muted)",
          "surface-subtle": "var(--semantic-bg-secondary)",
          "surface-card": "var(--semantic-bg-primary)",
          "surface-subtle-hover": "var(--semantic-surface-subtle-hover)",
          "surface-inverse": "var(--semantic-surface-inverse)",

          border: "var(--semantic-border)",
          "border-focus": "var(--semantic-border-focus)",
          "border-error": "var(--semantic-border-error)",
          "border-subtle": "var(--semantic-border)",
          "border-light": "var(--semantic-border)",

          success: "var(--semantic-success)",
          "success-bg": "var(--semantic-success-bg)",
          warning: "var(--semantic-warning)",
          "warning-bg": "var(--semantic-warning-bg)",
          error: "var(--semantic-error)",
          "error-bg": "var(--semantic-error-bg)",

          "focus-ring": "var(--semantic-focus-ring)",
        },

        // Legacy football colors - gradually replace with jade/navy
        field: {
          green: "#2D5016",
          light: "#4A7C59",
          dark: "#1A3009",
        },

        // Team colors - customizable per team
        team: {
          primary: "#00A86B", // Jade as default
          secondary: "#0F172A", // Navy as default
          accent: "#DC2626", // Strong red for accents
        },

        // Sidebar colors - enhanced for better contrast
        sidebar: {
          bg: "#0F172A", // Deep navy
          hover: "#1E293B", // Medium navy
          active: "#334155", // Lighter navy for active states
          text: "#F8FAFC", // Light text
          "text-muted": "#94A3B8", // Muted text
        },

        // Status indicators with strong contrast
        confidence: {
          high: "#047857", // Dark jade
          medium: "#D97706", // Amber
          low: "#DC2626", // Red
          unknown: "#64748B", // Neutral gray
        },

        // Play type colors with enhanced contrast
        play: {
          run: "#7C3AED", // Purple with better contrast
          pass: "#0369A1", // Blue with strong contrast
          special: "#D97706", // Amber with good contrast
          defense: "#DC2626", // Red with strong contrast
        },
      },

      fontFamily: {
        // BoxCall Typography Hierarchy - "Dependable & Professional"
        display: ["Bebas Neue", "system-ui", "sans-serif"], // Bebas Neue for display/headlines
        sans: ["Inter", "system-ui", "sans-serif"], // Consistent Inter usage
        mono: ["JetBrains Mono", "Consolas", "monospace"], // Better monospace font
        // Adding weight-specific variants
        "sans-medium": ["Inter", "system-ui", "sans-serif"],
        "sans-semibold": ["Inter", "system-ui", "sans-serif"],
        "sans-bold": ["Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Enhanced typography scale for better hierarchy
        xs: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        sm: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        base: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        lg: ["1.125rem", { lineHeight: "1.75rem", fontWeight: "500" }],
        xl: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
      },

      // Phase 3: Token-based Border Radius System
      // Uses CSS custom properties from generated-tokens.css
      borderRadius: {
        none: "var(--radius-none)", // 0 - no rounding
        sm: "var(--radius-sm)", // 6px - subtle elements
        DEFAULT: "var(--radius-base)", // 8px - default
        md: "var(--radius-md)", // 12px - cards, inputs
        lg: "var(--radius-lg)", // 16px - modals, panels
        xl: "var(--radius-xl)", // 24px - feature cards
        "2xl": "var(--radius-2xl)", // 32px - hero elements
        "3xl": "var(--radius-3xl)", // 40px - extra large
        full: "var(--radius-full)", // 9999px - circular
        // Glass-specific variants
        "glass-sm": "var(--radius-glass-sm)", // 12px - glass small
        glass: "var(--radius-glass)", // 16px - glass default
        "glass-lg": "var(--radius-glass-lg)", // 24px - glass large
      },

      // ============================================
      // SPACING SCALE - Phase 3: 8px Grid System
      // ============================================
      // Enforces consistent spacing with 8px base grid.
      // Maps to CSS custom properties from generated-tokens.css
      spacing: {
        // Core 8px Grid Scale (preferred)
        0: "var(--space-0)", // 0px - none
        px: "1px", // 1px - hairline borders
        0.5: "var(--space-0\\.5)", // 2px - ultra-tight (rare)
        1: "var(--space-1)", // 4px - xs tight
        2: "var(--space-2)", // 8px - sm minimum
        3: "var(--space-3)", // 12px - md compact
        4: "var(--space-4)", // 16px - base comfortable
        5: "var(--space-5)", // 20px - lg generous
        6: "var(--space-6)", // 24px - xl spacious
        8: "var(--space-8)", // 32px - 2xl section spacing
        10: "var(--space-10)", // 40px - 3xl large sections
        12: "var(--space-12)", // 48px - 4xl page spacing
        16: "var(--space-16)", // 64px - 5xl hero spacing
        20: "var(--space-20)", // 80px - 6xl extra large
        24: "var(--space-24)", // 96px - 7xl maximum
        32: "var(--space-32)", // 128px - 8xl extreme

        // Deprecated - Phase out these values (not 8px aligned)
        // Use nearest 8px multiple instead
        1.5: "var(--space-1\\.5)", // 6px - DEPRECATED: use 2 (8px)
        2.5: "var(--space-2\\.5)", // 10px - DEPRECATED: use 3 (12px)
        3.5: "var(--space-3\\.5)", // 14px - DEPRECATED: use 4 (16px)
        4.5: "var(--space-4\\.5)", // 18px - DEPRECATED: use 5 (20px)
        5.5: "var(--space-5\\.5)", // 22px - DEPRECATED: use 6 (24px)

        // Legacy custom spacing (keep for compatibility)
        18: "4.5rem", // 72px - legacy
        88: "22rem", // 352px - legacy
        128: "32rem", // 512px - legacy

        // ============================================
        // SEMANTIC SPACING TOKENS - Design System
        // ============================================
        // Consistent naming for common spacing patterns
        "spacing-xs": "var(--space-2)", // 8px - minimum spacing
        "spacing-sm": "var(--space-3)", // 12px - compact spacing
        "spacing-md": "var(--space-4)", // 16px - comfortable spacing (default)
        "spacing-lg": "var(--space-6)", // 24px - spacious section spacing
        "spacing-xl": "var(--space-8)", // 32px - large section spacing
        "spacing-2xl": "var(--space-12)", // 48px - page section spacing
        "spacing-3xl": "var(--space-16)", // 64px - hero spacing
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "confidence-pulse": "confidencePulse 2s infinite",
        "card-hover": "cardHover 0.3s ease-out forwards",
        "card-glow": "cardGlow 0.4s ease-out forwards",
        "card-lift": "cardLift 0.2s ease-out forwards",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        confidencePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        cardHover: {
          "0%": { transform: "translateY(0) scale(1) rotate(0deg)" },
          "100%": { transform: "translateY(-4px) scale(1.02) rotate(0.5deg)" },
        },
        cardGlow: {
          "0%": {
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
          "100%": {
            boxShadow:
              "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 20px rgba(124, 58, 237, 0.15)",
          },
        },
        cardLift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-2px)" },
        },
      },

      boxShadow: {
        // Standard elevation shadows - mapped to CSS custom properties
        none: "var(--shadow-none)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",

        // Glass morphism shadows
        glass: "var(--shadow-glass)",
        "glass-dark": "var(--shadow-glass-dark)",
        "glass-elevated": "var(--shadow-glass-elevated)",
        "glass-elevated-dark": "var(--shadow-glass-elevated-dark)",
        "glass-subtle": "var(--shadow-glass-subtle)",
        "glass-subtle-dark": "var(--shadow-glass-subtle-dark)",

        // Interactive state shadows
        hover: "var(--shadow-hover)",
        active: "var(--shadow-active)",

        // Component-specific shadows
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        modal: "var(--shadow-modal)",
        dropdown: "var(--shadow-dropdown)",
        button: "var(--shadow-button)",
        "button-hover": "var(--shadow-button-hover)",

        // Colored accent shadows
        jade: "var(--shadow-jade)",
        electric: "var(--shadow-electric)",

        // Legacy shadows (deprecated - kept for backward compatibility)
        "play-card": "var(--shadow-card)",
        confidence: "0 0 20px rgba(16, 185, 129, 0.3)",
      },

      backdropBlur: {
        xs: "2px",
      },

      // ============================================
      // Z-INDEX SCALE - Design System Stacking Context
      // ============================================
      // Establishes proper layering hierarchy across all components
      // Prevents z-index conflicts and ensures predictable stacking
      zIndex: {
        auto: "auto",
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        // Semantic z-index values (preferred)
        base: "0", // Default layer
        dropdown: "40", // Dropdowns and select menus
        sticky: "45", // Sticky headers/footers
        modal: "50", // Modal dialogs
        popover: "50", // Popovers (same as modal)
        toast: "55", // Toast notifications (above modals)
        tooltip: "60", // Tooltips (always on top)
        // Legacy values (for backwards compatibility)
        negative: "-1",
        1: "1",
        999: "999",
        9999: "9999",
      },

      // ============================================
      // ANIMATION SYSTEM - Phase 3 Design System
      // ============================================
      // Maps to CSS custom properties for consistent motion

      // Duration Scale - Timing Utilities
      transitionDuration: {
        instant: "var(--duration-instant)", // 75ms - immediate feedback
        fast: "var(--duration-fast)", // 150ms - quick interactions
        DEFAULT: "var(--duration-base)", // 200ms - default speed
        base: "var(--duration-base)", // 200ms - standard animations
        medium: "var(--duration-medium)", // 300ms - moderate animations
        slow: "var(--duration-slow)", // 500ms - deliberate animations
        slower: "var(--duration-slower)", // 700ms - very slow transitions
      },

      // Easing Functions - Motion Curves
      transitionTimingFunction: {
        linear: "var(--ease-linear)",
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        DEFAULT: "var(--ease-out)", // Default to ease-out
        bounce: "var(--ease-bounce)",
        spring: "var(--ease-spring)",
      },

      // Scale Transform Values
      scale: {
        subtle: "var(--scale-subtle)", // 1.02 - subtle card hover
        base: "var(--scale-base)", // 1.05 - standard button hover
        strong: "var(--scale-strong)", // 1.1 - icon button hover
        press: "var(--scale-press)", // 0.95 - active press
        "press-strong": "var(--scale-press-strong)", // 0.9 - strong press
      },

      // Opacity Scale for Fades
      opacity: {
        0: "var(--opacity-invisible)",
        faint: "var(--opacity-faint)", // 0.1
        subtle: "var(--opacity-subtle)", // 0.3
        medium: "var(--opacity-medium)", // 0.5
        strong: "var(--opacity-strong)", // 0.7
        opaque: "var(--opacity-opaque)", // 0.9
        100: "var(--opacity-full)",
      },

      // Translate Values for Lift/Slide Effects
      translate: {
        "lift-sm": "var(--translate-lift-sm)", // -2px
        "lift-base": "var(--translate-lift-base)", // -4px
        "lift-lg": "var(--translate-lift-lg)", // -8px
        "slide-sm": "var(--translate-slide-sm)", // 4px
        "slide-base": "var(--translate-slide-base)", // 8px
        "slide-lg": "var(--translate-slide-lg)", // 16px
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    auroraTheme,
  ],
};
