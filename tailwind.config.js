/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Football field inspired colors
        field: {
          green: "#2D5016",
          light: "#4A7C59",
          dark: "#1A3009",
        },
        // Team colors - customizable per team
        team: {
          primary: "#1E40AF",
          secondary: "#F59E0B",
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
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Oswald", "sans-serif"], // For headers and emphasis
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
