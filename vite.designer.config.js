import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './',
  base: '/designer/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'engine'),
      '@data': path.resolve(__dirname, 'data'),
    },
  },
  build: {
    outDir: 'dist/designer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        designer: path.resolve(__dirname, 'designer.html'),
      },
    },
  },
  server: {
    port: 5176,
    open: '/designer.html?designer&category=ships&id=scrap-ship',
  },
});
