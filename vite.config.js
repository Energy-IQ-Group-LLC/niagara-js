import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'niagara-js',
      fileName: (format) => `niagara-js.${format}.js`,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './lib'),
    },
  },
});
