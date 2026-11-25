import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/*.test.ts',
    reporter: [['list'], ['allure-playwright', {resultsDir: 'allure-results'}]],
    use: {
        baseURL: 'https://www.uitestingplayground.com',
        browserName: 'chromium',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        ignoreHTTPSErrors: true,
        permissions: ['clipboard-read', 'clipboard-write'],
    },
});
