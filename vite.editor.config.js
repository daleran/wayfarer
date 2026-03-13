import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'js'),
      '@data': path.resolve(__dirname, 'data'),
    },
  },
  server: {
    port: 5177,
    open: '/editor.html?map=arena',
  },
});
