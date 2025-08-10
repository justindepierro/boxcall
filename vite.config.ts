import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@state": path.resolve(__dirname, "src/state"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@design-system": path.resolve(__dirname, "src/design-system"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: "BoxCall - Team Management",
        short_name: "BoxCall",
        description: "Professional football team management platform",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          vendor: ["react", "react-dom", "react-router-dom"],

          // Heavy visual dependencies
          fabric: ["fabric"],
          calendar: [
            "@fullcalendar/core",
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react",
            "@fullcalendar/timegrid",
          ],
          pdf: ["@react-pdf/renderer", "jspdf", "html2canvas"],

          // Database and API
          data: [
            "@supabase/supabase-js",
            "@tanstack/react-query",
            "socket.io-client",
          ],

          // UI and utilities
          ui: [
            "lucide-react",
            "clsx",
            "@hello-pangea/dnd",
            "react-hook-form",
            "@hookform/resolvers",
          ],

          // Text editing and forms
          editor: ["slate", "slate-react", "react-mentions"],

          // Utilities
          utils: [
            "date-fns",
            "fuse.js",
            "papaparse",
            "dompurify",
            "zod",
            "zustand",
          ],
        },
      },
    },
    // Set chunk size warnings
    chunkSizeWarningLimit: 500,
  },
});
