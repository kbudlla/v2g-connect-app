import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { comlink } from 'vite-plugin-comlink';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [svgr(), react(), tsconfigPaths(), comlink()],
  worker: {
    plugins: [comlink()],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
