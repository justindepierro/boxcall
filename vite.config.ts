import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
