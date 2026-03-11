import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  server: {
    port: 5177,
    open: '/editor.html?map=arena',
  },
});
