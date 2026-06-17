import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  fullyParallel: false,
  retries: 1,
  // reporter: [['html', { open: 'never' }], ['list']],
  expect: {
    timeout: 20_000
  },
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 120_000
  },
  reporter: [
  ['list'],
  ['html'],
  ['allure-playwright']
],
  projects: [
  {
    name: 'setup',
    testMatch: /auth\.setup\.js/
  },

  {
    name: 'login',
    testMatch: /login\.spec\.js/
  },

  {
    name: 'chromium',
    testIgnore: /login\.spec\.js/,
    use: {
      storageState: 'playwright/.auth/user.json'
    },
    dependencies: ['setup']
  }
]
});