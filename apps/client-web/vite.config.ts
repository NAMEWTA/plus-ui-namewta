import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  server: { host: '127.0.0.1', port: 5174, strictPort: true }
});
