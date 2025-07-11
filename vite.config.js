// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // project root
  base: './', // relative base path for assets (can be '/', './', etc.)
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true, // opens the browser on npm run dev
  },
});
