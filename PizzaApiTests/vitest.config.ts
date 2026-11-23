import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['allure-vitest/setup'],
    reporters: [
      'verbose',
      ['allure-vitest/reporter', { resultsDir: 'allure-results' }],
    ],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    fileParallelism: false,
  },
});
