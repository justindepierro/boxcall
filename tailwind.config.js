/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // BoxCall Primary - Jade Green System
        jade: {
          50: "#ECFDF5", // Very light jade for backgrounds
          100: "#D1FAE5", // Light jade for hover states
          200: "#A7F3D0", // Soft jade for disabled states
          300: "#6EE7B7", // Medium jade for borders
          400: "#34D399", // Bright jade for active states
          500: "#00A86B", // PRIMARY - Main brand color
          600: "#059669", // Dark jade for hover/focus
          700: "#047857", // Darker jade for pressed states
          800: "#065F46", // Deep jade for dark mode
          900: "#064E3B", // Darkest jade for text
        },

        // BoxCall Secondary - Navy Blue System
        navy: {
          50: "#EFF6FF", // Very light navy
          100: "#DBEAFE", // Light navy for backgrounds
          200: "#BFDBFE", // Soft navy
          300: "#93C5FD", // Medium navy for borders
          400: "#60A5FA", // Bright navy
          500: "#1E3A8A", // PRIMARY - Main navy
          600: "#1E40AF", // Dark navy for hover
          700: "#1D4ED8", // Darker navy for focus
          800: "#1E3A8A", // Deep navy
          900: "#1E3A8A", // Darkest navy for text
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
          secondary: "#1E3A8A", // Navy as default
          accent: "#EF4444",
        },

        // UI colors
        sidebar: {
          bg: "#0F172A",
          hover: "#1E293B",
          active: "#334155",
        },

        confidence: {
          high: "#10B981",
          medium: "#F59E0B",
          low: "#EF4444",
          unknown: "#6B7280",
        },

        play: {
          run: "#8B5CF6",
          pass: "#06B6D4",
          special: "#F59E0B",
          defense: "#EF4444",
        },
      },

      fontFamily: {
        // BoxCall Typography Hierarchy
        display: ["Bebas Neue", "Arial Black", "sans-serif"], // Impact headers, team names, hero text
        sans: ["Inter", "system-ui", "sans-serif"], // UI elements, body text, interface
        mono: ["IBM Plex Mono", "Monaco", "monospace"], // Data, code, player stats, technical info
      },

      // BoxCall Square Component System
      borderRadius: {
        none: "0px", // No rounding
        xs: "2px", // Very subtle - inputs, technical elements
        sm: "4px", // Default for most UI - buttons, cards
        md: "6px", // Larger elements - modals, containers
        lg: "8px", // Maximum for hero sections only
        // REMOVED: xl, 2xl, 3xl, full (too rounded for masculine aesthetic)
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "confidence-pulse": "confidencePulse 2s infinite",
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
      },

      boxShadow: {
        "play-card":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        confidence: "0 0 20px rgba(16, 185, 129, 0.3)",
      },

      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
