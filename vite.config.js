// vite.config.js
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, path } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: '.', // optional if everything is in root
  base: './', // or '/' for absolute paths
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@auth': path.resolve(__dirname, './src/auth'),
      '@components': path.resolve(__dirname, './src/components'),
      '@config': path.resolve(__dirname, './src/config'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@state': path.resolve(__dirname, './src/state'),
      '@render': path.resolve(__dirname, './src/render'),
      '@core': path.resolve(__dirname, './src/core'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
});
