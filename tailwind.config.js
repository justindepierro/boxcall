import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

// Helper to create color scale from CSS variables
const createScale = (
  tokenName,
  steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
) =>
  steps.reduce((acc, step) => {
    acc[step] = `var(--color-${tokenName}-${step})`;
    return acc;
  }, {});

// Color system using design tokens
const colors = {
  // Brand colors
  jade: createScale("jade"),
  navy: createScale("navy"),

  // Accent colors (all use accent- prefix in CSS variables)
  orange: createScale("accent-orange"),
  purple: createScale("accent-purple"),
  pink: createScale("accent-pink"),
  amber: createScale("accent-amber"),
  red: createScale("accent-red"),
  blue: createScale("accent-blue"),
  cyan: createScale("accent-cyan"),
  lime: createScale("accent-lime"),
  indigo: createScale("accent-indigo"),
  teal: createScale("accent-teal"),
  emerald: createScale("accent-emerald"),

  // Semantic colors
  success: {
    DEFAULT: "var(--color-success)",
    lightest: "var(--color-success-lightest)",
    light: "var(--color-success-light)",
    base: "var(--color-success-base)",
    dark: "var(--color-success-dark)",
    darkest: "var(--color-success-darkest)",
  },
  warning: {
    DEFAULT: "var(--color-warning)",
    lightest: "var(--color-warning-lightest)",
    light: "var(--color-warning-light)",
    base: "var(--color-warning-base)",
    dark: "var(--color-warning-dark)",
    darkest: "var(--color-warning-darkest)",
  },
  error: {
    DEFAULT: "var(--color-error)",
    lightest: "var(--color-error-lightest)",
    light: "var(--color-error-light)",
    base: "var(--color-error-base)",
    dark: "var(--color-error-dark)",
    darkest: "var(--color-error-darkest)",
  },
  info: {
    DEFAULT: "var(--color-info)",
    lightest: "var(--color-info-lightest)",
    light: "var(--color-info-light)",
    base: "var(--color-info-base)",
    dark: "var(--color-info-dark)",
    darkest: "var(--color-info-darkest)",
  },

  // Text colors
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    tertiary: "var(--color-text-tertiary)",
    inverse: "var(--color-text-inverse)",
    accent: "var(--color-text-accent)",
    muted: "var(--color-text-muted)",
    disabled: "var(--color-text-disabled)",
  },

  // Background colors
  bg: {
    primary: "var(--color-bg-primary)",
    secondary: "var(--color-bg-secondary)",
    tertiary: "var(--color-bg-tertiary)",
    surface: "var(--color-bg-surface)",
    muted: "var(--color-bg-muted)",
    subtle: "var(--color-bg-subtle)",
  },
  
  // Backdrop/Overlay colors (for modals, sheets, overlays)
  backdrop: {
    DEFAULT: "var(--color-backdrop)",
    light: "var(--color-backdrop-light)",
    dark: "var(--color-backdrop-dark)",
    blur: "var(--color-backdrop-blur)",
  },

  // Border colors
  border: {
    DEFAULT: "var(--color-border-primary)",
    primary: "var(--color-border-primary)",
    secondary: "var(--color-border-secondary)",
    accent: "var(--color-border-accent)",
    focus: "var(--color-border-focus)",
    muted: "var(--color-border-muted)",
  },

  // Interactive states (for buttons, etc.)
  interactive: {
    primary: {
      base: "var(--color-interactive-primary-base)",
      hover: "var(--color-interactive-primary-hover)",
      active: "var(--color-interactive-primary-active)",
      disabled: "var(--color-interactive-primary-disabled)",
      focus: "var(--color-interactive-primary-focus)",
    },
    secondary: {
      base: "var(--color-interactive-secondary-base)",
      hover: "var(--color-interactive-secondary-hover)",
      active: "var(--color-interactive-secondary-active)",
      disabled: "var(--color-interactive-secondary-disabled)",
    },
    success: {
      base: "var(--color-interactive-success-base)",
      hover: "var(--color-interactive-success-hover)",
      active: "var(--color-interactive-success-active)",
      disabled: "var(--color-interactive-success-disabled)",
    },
    danger: {
      base: "var(--color-interactive-danger-base)",
      hover: "var(--color-interactive-danger-hover)",
      active: "var(--color-interactive-danger-active)",
      disabled: "var(--color-interactive-danger-disabled)",
    },
    ghost: {
      base: "var(--color-interactive-ghost-base)",
      hover: "var(--color-interactive-ghost-hover)",
      active: "var(--color-interactive-ghost-active)",
    },
  },
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    // Mobile-first breakpoints aligned with useBreakpoint() hook
    screens: {
      sm: "768px",
      md: "1024px",
      lg: "1280px",
      xl: "1440px",
      "2xl": "1920px",
    },
    extend: {
      colors,

      // Spacing system
      spacing: {
        0: "var(--spacing-0)",
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        10: "var(--spacing-10)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
        20: "var(--spacing-20)",
        24: "var(--spacing-24)",
        32: "var(--spacing-32)",
        px: "1px",
        // Semantic spacing
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
      },

      // Typography
      fontFamily: {
        primary: "var(--font-family-primary)",
        heading: "var(--font-family-heading)",
        mono: "var(--font-family-mono)",
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        md: "var(--font-size-md)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
      },
      fontWeight: {
        thin: "var(--font-weight-thin)",
        extralight: "var(--font-weight-extralight)",
        light: "var(--font-weight-light)",
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
        extrabold: "var(--font-weight-extrabold)",
        black: "var(--font-weight-black)",
      },
      lineHeight: {
        none: "var(--line-height-none)",
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },

      // Shadows (includes brand-colored shadows for modern elevation)
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        base: "var(--shadow-base)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        none: "var(--shadow-none)",
        // Brand-colored shadows for modern elevation
        "jade-sm": "0 2px 8px rgba(79, 209, 197, 0.15)",
        "jade-md": "0 4px 16px rgba(79, 209, 197, 0.2)",
        "jade-lg": "0 8px 32px rgba(79, 209, 197, 0.25)",
        "orange-sm": "0 2px 8px rgba(255, 159, 64, 0.15)",
        "orange-md": "0 4px 16px rgba(255, 159, 64, 0.2)",
        "orange-lg": "0 8px 32px rgba(255, 159, 64, 0.25)",
        "purple-sm": "0 2px 8px rgba(168, 85, 247, 0.15)",
        "purple-md": "0 4px 16px rgba(168, 85, 247, 0.2)",
        "purple-lg": "0 8px 32px rgba(168, 85, 247, 0.25)",
        "blue-sm": "0 2px 8px rgba(59, 130, 246, 0.15)",
        "blue-md": "0 4px 16px rgba(59, 130, 246, 0.2)",
        "blue-lg": "0 8px 32px rgba(59, 130, 246, 0.25)",
      },

      // Border radius
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        base: "var(--radius-base)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },

      // Background gradients for modern cards
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh-jade":
          "radial-gradient(circle at top right, rgba(79,209,197,0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(79,209,197,0.1), transparent 50%)",
        "gradient-mesh-orange":
          "radial-gradient(circle at top right, rgba(255,159,64,0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(255,159,64,0.1), transparent 50%)",
        "gradient-mesh-purple":
          "radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(168,85,247,0.1), transparent 50%)",
      },

      // Animations
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
        slowest: "var(--duration-slowest)",
      },
      transitionTimingFunction: {
        linear: "var(--easing-linear)",
        ease: "var(--easing-ease)",
        "ease-in": "var(--easing-ease-in)",
        "ease-out": "var(--easing-ease-out)",
        "ease-in-out": "var(--easing-ease-in-out)",
        spring: "var(--easing-spring)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn var(--duration-normal) var(--easing-ease)",
        "slide-up": "slideUp var(--duration-normal) var(--easing-ease-out)",
        "scale-in": "scaleIn var(--duration-fast) var(--easing-spring)",
        // Modern SaaS animations
        shimmer: "shimmer 2s infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        // Modern shimmer effect for loading states
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        // Floating animation for icons/badges
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Glow pulse for status indicators
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },

      // Layout
      maxWidth: {
        xs: "var(--container-xs)",
        sm: "var(--container-sm)",
        md: "var(--container-md)",
        lg: "var(--container-lg)",
        xl: "var(--container-xl)",
        "2xl": "var(--container-2xl)",
        "3xl": "var(--container-3xl)",
        "4xl": "var(--container-4xl)",
        "5xl": "var(--container-5xl)",
        "6xl": "var(--container-6xl)",
        "7xl": "var(--container-7xl)",
      },

      // Z-index (mapped to --z-index-* CSS variables)
      zIndex: {
        dropdown: "var(--z-index-dropdown)",
        sticky: "var(--z-index-sticky)",
        fixed: "var(--z-index-fixed)",
        "modal-backdrop": "var(--z-index-modal-backdrop)",
        modal: "var(--z-index-modal)",
        popover: "var(--z-index-popover)",
        tooltip: "var(--z-index-tooltip)",
      },
    },
  },
  safelist: [
    // Personnel badge classes - explicitly list all to ensure CSS generation
    // Gradients
    "from-electric-500",
    "to-electric-700",
    "from-red-500",
    "to-red-700",
    "from-emerald-500",
    "to-emerald-700",
    "from-amber-400",
    "to-amber-600",
    "from-purple-500",
    "to-purple-700",
    "from-orange-500",
    "to-orange-700",
    "from-cyan-500",
    "to-cyan-700",
    "from-pink-500",
    "to-pink-700",
    "from-slate-600",
    "to-slate-800",
    "from-teal-500",
    "to-teal-700",
    "from-lime-500",
    "to-lime-700",
    "from-indigo-500",
    "to-indigo-700",
    // Backgrounds
    "bg-electric-600",
    "bg-red-600",
    "bg-emerald-600",
    "bg-amber-500",
    "bg-purple-600",
    "bg-orange-600",
    "bg-cyan-600",
    "bg-pink-600",
    "bg-slate-700",
    "bg-teal-600",
    "bg-lime-600",
    "bg-indigo-600",
    // Text colors
    "text-white",
    "text-amber-950",
    // Borders
    "border-electric-700",
    "border-red-700",
    "border-emerald-700",
    "border-amber-600",
    "border-purple-700",
    "border-orange-700",
    "border-cyan-700",
    "border-pink-700",
    "border-slate-800",
    "border-teal-700",
    "border-lime-700",
    "border-indigo-700",
  ],
  plugins: [forms, typography],
};
