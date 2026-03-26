import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@aifacet/schema': resolve(__dirname, '../schema/src/index.ts'),
      '@aifacet/vault': resolve(__dirname, '../vault/src/index.ts'),
    },
  },
});
