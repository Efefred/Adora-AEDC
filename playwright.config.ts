// // import { defineConfig } from '@playwright/test';
// // import 'dotenv/config';

// // export default defineConfig({
// //   testDir: './tests',

// //   timeout: 60_000,

// //   use: {
// //     baseURL: process.env.BASE_URL,
// //     headless: true,
// //     trace: 'on-first-retry',
// //     screenshot: 'only-on-failure',
// //     video: 'retain-on-failure',
// //   },

// //   reporter: [['html', { open: 'never' }]],
// // });

// import { defineConfig } from '@playwright/test';
// import 'dotenv/config';

// export default defineConfig({
//   testDir: './tests',

//   timeout: 90_000,

//   expect: {
//     timeout: 15_000,
//   },

//   use: {
//     baseURL: process.env.BASE_URL,
//     headless: true,
//     trace: 'on-first-retry',
//     screenshot: 'only-on-failure',
//     video: 'retain-on-failure',
//   },

//   reporter: [['html', { open: 'never' }]],
// });

import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({

  testDir: './tests',

  /* Global test timeout */
  timeout: 180_000,

  /* Expect timeout */
  expect: {
    timeout: 20_000,
  },

  /* Run tests sequentially for now (safer for staging envs) */
  fullyParallel: false,

  /* Retries help with flaky UI/network environments */
  retries: 1,

  /* Reporter */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {

    /* Base URL from .env */
    baseURL: process.env.BASE_URL,

    /* Headless by default */
    headless: true,

    /* Stable viewport for wide data grids */
    viewport: { width: 1920, height: 1080 },

    /* Useful debugging artifacts */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Slow enterprise apps benefit from larger navigation timeout */
    navigationTimeout: 120_000,

    /* Maximize window in headed mode */
    launchOptions: {
      args: ['--start-maximized']
    }
  },

});