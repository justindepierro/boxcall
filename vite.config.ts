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
    hmr: {
      overlay: false,
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
      "@state": path.resolve(__dirname, "src/state"),
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
              description: "Professional football team management platform with real-time collaboration",
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
                  icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }],
                },
                {
                  name: "Roster",
                  short_name: "Roster", 
                  description: "Manage team roster",
                  url: "/roster",
                  icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }],
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
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets as base64
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          calendar: [
            "@fullcalendar/core",
            "@fullcalendar/daygrid", 
            "@fullcalendar/timegrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react",
          ],
          ui: ["@headlessui/react", "@heroicons/react", "framer-motion"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          dnd: ["@hello-pangea/dnd"],
        },
        // Optimize asset filenames for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (extType === 'css') {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
