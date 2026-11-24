import {defineConfig} from 'vitest/config';
import {join} from "node:path";

process.loadEnvFile();

export default defineConfig({
    resolve: {
        alias: {
            '@': join(import.meta.dirname, 'src'),
        },
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['allure-vitest/setup', './tests/setup.ts'],
        reporters: [
            'verbose',
            ['allure-vitest/reporter', {resultsDir: 'allure-results'}],
        ],
        testTimeout: 15_000,
        hookTimeout: 15_000,
        fileParallelism: false,
    },
});
