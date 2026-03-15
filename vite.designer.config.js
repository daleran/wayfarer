import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@data': path.resolve(__dirname, 'data'),
    },
  },
  server: {
    port: 5176,
    open: '/designer.html?designer&category=ships&id=scrap-ship',
  },
});
