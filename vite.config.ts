import react from '@vitejs/plugin-react';
import { readdirSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { comlink } from 'vite-plugin-comlink';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// Emulate the tsconfig baseURL feature in vite + rollup
// Normally this works fine, because tsc is invoked before and handles this for us
// However, when building a worker, this is not entirely the case and rollup handles this for us
const absolutePathAliases: { [key: string]: string } = {};
const srcPath = path.resolve('./src/');
// Ajust the regex here to include .vue, .js, .jsx, etc.. files from the src/ folder
const srcRootContent = readdirSync(srcPath, { withFileTypes: true }).map((dirent) =>
  dirent.name.replace(/(\.ts){1}(x?)/, ''),
);
srcRootContent.forEach((directory) => {
  absolutePathAliases[directory] = path.join(srcPath, directory);
});

export default defineConfig({
  plugins: [svgr(), react(), tsconfigPaths(), comlink()],
  worker: {
    plugins: [comlink()],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      ...absolutePathAliases,
    },
  },
});
