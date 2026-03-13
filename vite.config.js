import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Wrangler's auto-setup requires a plugins array to be present
  plugins: [],
  root: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'js'),
      '@data': path.resolve(__dirname, 'data'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
