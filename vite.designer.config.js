import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  server: {
    port: 5176,
    open: '/designer.html?designer&category=ships&id=scrap-ship',
  },
});
