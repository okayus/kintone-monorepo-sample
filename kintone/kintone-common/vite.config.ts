import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KintoneCommon',
      fileName: 'kintone-common',
      formats: ['es']
    },
    rollupOptions: {
      external: ['@kintone/rest-api-client']
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});