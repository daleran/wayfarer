import { defineConfig } from 'vite';

export default defineConfig({
  // Project root directory
  root: './',
  build: {
    // Output directory for the build
    outDir: 'dist',
    // Ensure assets are handled correctly
    assetsDir: 'assets',
    // Generate sourcemaps for easier debugging
    sourcemap: true,
  },
  server: {
    // Port for the dev server
    port: 5173,
    // Open the browser automatically
    open: true,
  },
});
