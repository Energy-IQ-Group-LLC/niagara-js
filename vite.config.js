import { builtinModules } from 'module';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { dependencies } from '@root/package.json';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'index.js'),
      name: 'niagara-js',
      fileName: (format) => `niagara-js.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        ...builtinModules, // Exclude Node.js built-ins
        ...Object.keys(dependencies || {}), // Exclude package dependencies
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@root': resolve(__dirname, '.'),
    },
  },
});
