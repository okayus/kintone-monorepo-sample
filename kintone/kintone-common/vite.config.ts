import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KintoneCommon',
      fileName: 'kintone-common',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['@kintone/rest-api-client'],
      output: {
        globals: {
          '@kintone/rest-api-client': 'KintoneRestAPIClient'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});