import { defineConfig } from 'vite';

export default defineConfig({
  // Wrangler's auto-setup requires a plugins array to be present
  plugins: [],
  root: './',
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
