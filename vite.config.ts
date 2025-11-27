import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

const enablePWA = process.env.VITE_ENABLE_PWA === "true";
const useLightningCss = process.env.MINIFY_CSS === "lightningcss";
const analyzeBundle = process.env.ANALYZE === "true";

export default defineConfig({
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false, // Allow Vite to try next available port if 5173 is busy
    open: true, // Auto-open browser on server start
    hmr: {
      overlay: true, // Show error overlay for better debugging
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@stores": path.resolve(__dirname, "src/stores"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@design-system": path.resolve(__dirname, "src/design-system"),
      "@adapters": path.resolve(__dirname, "src/adapters"),
      "@data": path.resolve(__dirname, "src/data"),
      "@domain": path.resolve(__dirname, "src/domain"),
      "@features": path.resolve(__dirname, "src/features"),
      "@infra": path.resolve(__dirname, "src/infra"),
      "@services": path.resolve(__dirname, "src/services"),
      "@services/": path.resolve(__dirname, "src/services/"),
    },
  },
  plugins: [
    react(),
    ...(enablePWA
      ? [
          VitePWA({
            registerType: "autoUpdate",
            devOptions: {
              enabled: enablePWA,
            },
            workbox: {
              globPatterns: [
                "**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}",
              ],
              globIgnores: ["**/*.ts", "**/*.tsx"],
              maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB (up from 2MB default)
              runtimeCaching: [
                // Supabase API calls
                {
                  urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\//i,
                  handler: "NetworkFirst",
                  options: {
                    cacheName: "supabase-api-cache",
                    networkTimeoutSeconds: 3,
                    expiration: {
                      maxEntries: 50,
                      maxAgeSeconds: 60 * 5, // 5 minutes
                    },
                  },
                },
                // Static assets (fonts, images)
                {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "static-images-cache",
                    expiration: {
                      maxEntries: 100,
                      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                    },
                  },
                },
                {
                  urlPattern: /\.(?:woff2?|eot|ttf|otf)$/i,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "fonts-cache",
                    expiration: {
                      maxEntries: 30,
                      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                    },
                  },
                },
                // App shell
                {
                  urlPattern: /^https:\/\/localhost:5173\//i,
                  handler: "NetworkFirst",
                  options: {
                    cacheName: "app-shell-cache",
                    networkTimeoutSeconds: 2,
                    expiration: {
                      maxEntries: 20,
                      maxAgeSeconds: 60 * 60 * 24, // 1 day
                    },
                  },
                },
              ],
            },
            manifest: {
              name: "BoxCall - Team Management",
              short_name: "BoxCall",
              description:
                "Professional football team management platform with real-time collaboration",
              theme_color: "#1e40af",
              background_color: "#ffffff",
              display: "standalone",
              orientation: "portrait-primary",
              scope: "/",
              start_url: "/?source=pwa",
              categories: ["sports", "productivity", "utilities"],
              lang: "en",
              dir: "ltr",
              icons: [
                {
                  src: "favicon.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                  purpose: "any maskable",
                },
              ],
              shortcuts: [
                {
                  name: "Dashboard",
                  short_name: "Dashboard",
                  description: "View team dashboard",
                  url: "/dashboard",
                  icons: [
                    { src: "favicon.svg", sizes: "any", type: "image/svg+xml" },
                  ],
                },
                {
                  name: "Roster",
                  short_name: "Roster",
                  description: "Manage team roster",
                  url: "/roster",
                  icons: [
                    { src: "favicon.svg", sizes: "any", type: "image/svg+xml" },
                  ],
                },
              ],
            },
          }),
        ]
      : []),
    ...(analyzeBundle
      ? [
          visualizer({
            filename: "./reports/bundle-analysis.html",
            open: true,
            gzipSize: true,
            brotliSize: true,
            template: "treemap", // or "sunburst", "network"
          }),
        ]
      : []),
  ],
  build: {
    manifest: true,
    cssMinify: useLightningCss ? "lightningcss" : "esbuild",
    target: "es2022",
    minify: "esbuild", // 🚀 FASTER: Switch from terser to esbuild for 2-3x faster minification
    // Remove terserOptions since we're using esbuild
    // terserOptions: { ... },

    // 🚀 PERFORMANCE: Enable build caching for faster rebuilds
    watch: null, // Disable watch mode for production builds

    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets as base64
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React (smaller chunk)
          "react-vendor": ["react", "react-dom"],

          // Router separate for better caching
          "router": ["react-router-dom"],

          // Data & State Management - Split for better granularity
          "supabase": ["@supabase/supabase-js"],
          "query-client": ["@tanstack/react-query"],
          "zustand": ["zustand"],

          // Heavy UI Libraries (lazy load these) - Split further for better caching
          "calendar-core": ["@fullcalendar/core"],
          "calendar-plugins": [
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react",
          ],
          "pdf-core": ["@react-pdf/renderer"],
          "pdf-utils": ["jszip"],
          "charts": ["recharts"],

          // UI Components - Split for better granularity
          "ui-core": [
            "@headlessui/react",
            "@radix-ui/react-popover",
          ],
          "ui-icons": ["@heroicons/react", "lucide-react"],
          "ui-dnd": ["@hello-pangea/dnd"],

          // Animations & Interactions
          animations: ["framer-motion", "@use-gesture/react"],

          // Forms & Validation
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],

          // Utilities - Split heavy utilities
          "date-utils": ["date-fns"],
          "search-utils": ["fuse.js"],
          "style-utils": ["clsx"],

          // Large third-party libraries
          "workbox": ["workbox-precaching", "workbox-routing", "workbox-strategies"],
        },
        // Optimize asset filenames for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const extType = info[info.length - 1];

          if (
            /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || "")
          ) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || "")) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (extType === "css") {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increased slightly to accommodate better splitting
    // 🚀 PERFORMANCE: Optimized for production builds
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    reportCompressedSize: true, // Report gzip sizes to track bundle improvements

    // 🚀 NEW: Build performance optimizations
    cssCodeSplit: true, // Split CSS for better caching
    modulePreload: {
      polyfill: false, // Disable polyfill for better performance
    },
  },
});
