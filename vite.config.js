// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // optional if everything is in root
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
  },
});
