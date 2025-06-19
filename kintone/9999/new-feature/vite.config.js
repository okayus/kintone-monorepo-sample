import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'KintoneApp9999NewFeature',
      fileName: 'new-feature',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        extend: true,
        globals: {}
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js'
  }
});