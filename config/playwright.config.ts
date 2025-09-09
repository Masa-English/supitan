import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: true,
  },
});


