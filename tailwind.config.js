/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // BoxCall Primary - Enhanced Jade Green System (More Contrast)
        jade: {
          50: "#ECFDF5", // Very light jade for backgrounds
          100: "#D1FAE5", // Light jade for hover states
          200: "#A7F3D0", // Soft jade for disabled states
          300: "#6EE7B7", // Medium jade for borders
          400: "#34D399", // Bright jade for active states
          500: "#00A86B", // PRIMARY - Main brand color (unchanged)
          600: "#047857", // DARKER - Better contrast for hover/focus
          700: "#065F46", // Much darker jade for pressed states
          800: "#064E3B", // Deep jade for dark mode backgrounds
          900: "#1F2937", // Near black with jade tint for text
          950: "#111827", // Ultra dark jade for maximum contrast
        },

        // BoxCall Secondary - Enhanced Navy Blue System (Lighter Options)
        navy: {
          50: "#F8FAFC", // Almost white with navy tint
          100: "#F1F5F9", // Very light navy for backgrounds
          200: "#E2E8F0", // Light navy for subtle backgrounds
          300: "#CBD5E1", // Medium navy for borders
          400: "#94A3B8", // Muted navy for disabled text
          500: "#64748B", // Medium navy for secondary text
          600: "#475569", // Dark navy for body text
          700: "#334155", // Darker navy for headings
          800: "#1E293B", // Deep navy for emphasis
          900: "#0F172A", // Primary navy - main dark color
          950: "#020617", // Ultra dark navy for maximum contrast
        },

        // Enhanced Contrast System - "Carhartt Reliability"
        contrast: {
          // High contrast pairings for maximum readability
          'jade-on-white': "#047857", // Dark jade on white backgrounds
          'white-on-jade': "#FFFFFF", // White text on jade backgrounds
          'navy-on-light': "#0F172A", // Dark navy on light backgrounds
          'light-on-navy': "#F8FAFC", // Light text on navy backgrounds
          
          // Status colors with better contrast
          success: "#047857", // Darker jade for success states
          warning: "#D97706", // Amber with good contrast
          error: "#DC2626", // Red with strong contrast
          info: "#0369A1", // Blue with solid contrast
        },

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
          }
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
          'text-muted': "#94A3B8", // Muted text
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
        'sans-medium': ["Inter", "system-ui", "sans-serif"],
        'sans-semibold': ["Inter", "system-ui", "sans-serif"],
        'sans-bold': ["Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Enhanced typography scale for better hierarchy
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
      },

      // BoxCall Square Component System - "Industrial Strength"
      borderRadius: {
        none: "0px", // No rounding - most industrial
        xs: "2px", // Very subtle - inputs, technical elements  
        sm: "4px", // Default for most UI - buttons, cards
        md: "6px", // Larger elements - modals, containers
        lg: "8px", // Maximum for special elements only
        // Removed xl+ values for more angular, industrial look
      },

      spacing: {
        // Custom tight spacing for BoxCall
        0.5: "0.125rem", // 2px - ultra-tight
        1.5: "0.375rem", // 6px - tight
        2.5: "0.625rem", // 10px - compact
        3.5: "0.875rem", // 14px - comfortable
        4.5: "1.125rem", // 18px - standard
        5.5: "1.375rem", // 22px - loose
        
        // Existing custom spacing
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
