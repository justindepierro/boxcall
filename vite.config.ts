import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
const enablePWA = process.env.VITE_ENABLE_PWA === "true";
const useLightningCss = process.env.MINIFY_CSS === "lightningcss";

export default defineConfig({
  server: {
    open: true,
  },
  worker: {
    // Ensure web workers emitted as ESM. IIFE/UMD are not supported with code-splitting workers in Vite 5+.
    format: "es",
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Strip console/debugger in production transforms
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
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
      // Keep Vite in sync with tsconfig paths for future-proof imports
      "@adapters": path.resolve(__dirname, "src/adapters"),
      "@data": path.resolve(__dirname, "src/data"),
      "@domain": path.resolve(__dirname, "src/domain"),
      "@features": path.resolve(__dirname, "src/features"),
      "@infra": path.resolve(__dirname, "src/infra"),
  "@services": path.resolve(__dirname, "src/services"),
      "@telemetry": path.resolve(__dirname, "src/telemetry"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
  plugins: [
    react(),
    // Include the PWA plugin only when explicitly enabled to avoid transform instability in CI builds
    ...(enablePWA
      ? [
          VitePWA({
            registerType: "autoUpdate",
            // Avoid esbuild trying to parse TSX when plugin does internal transforms
            minify: false,
            workbox: {
              globPatterns: [
                "**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}",
              ],
              // Ensure Workbox doesn't scan source TS/TSX files
              globIgnores: ["**/*.ts", "**/*.tsx"],
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
        ]
      : []),
  ],
  build: {
    // Emit manifest for bundle analysis tools
    manifest: true,
    // CSS minifier: default esbuild for Tailwind arbitrary selectors; allow opt-in lightningcss trials
    cssMinify: useLightningCss ? "lightningcss" : "esbuild",
    // Target modern browsers for smaller bundles; adjust if legacy browser support is required
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          vendor: ["react", "react-dom", "react-router-dom"],
          // Calendar stack
          calendar: [
            "@fullcalendar/core",
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react",
            "@fullcalendar/timegrid",
          ],
          // PDF renderer
          pdfRenderer: ["@react-pdf/renderer"],
          // Data layer
          data: ["@supabase/supabase-js", "@tanstack/react-query"],
          // Drag and drop
          dnd: ["@hello-pangea/dnd"],
        },
      },
    },
    // Set chunk size warnings
    chunkSizeWarningLimit: 500,
  },
});
